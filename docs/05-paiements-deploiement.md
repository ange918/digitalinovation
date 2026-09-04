# FASHLINK — Paiements mobile money & deploiement

> Livrable 5. Code correspondant : `src/lib/payments/`,
> `src/lib/subscription-activation.ts`, `src/app/api/webhooks/`.

## 1. Pourquoi cette architecture

Au Benin, le paiement passe par le telephone : MTN MoMo, Moov Money, Celtiis
Cash, Wave. Trois contraintes en decoulent, et elles dictent toute la
conception.

1. **Pas de prelevement recurrent fiable.** Aucun de ces canaux ne permet un
   debit automatique mensuel comme une carte bancaire. → `autoRenew` vaut
   `false` par defaut, l'abonnement a une **date de fin ferme**, et le
   renouvellement est une action volontaire du recruteur.
2. **Le reseau coupe.** Un client peut valider son paiement et perdre la
   connexion avant la redirection. → **Le webhook fait foi, jamais le retour
   navigateur.** La page de retour n'affiche qu'un etat, elle n'active rien.
3. **Les webhooks sont rejoues.** Les PSP re-emettent en cas de doute. →
   **Idempotence obligatoire**, sinon un recruteur obtient deux abonnements.

## 2. Flux nominal

```
 Recruteur              FASHLINK                     PSP                Reseau MoMo
     │                     │                          │                      │
     │ choisit Pro/mensuel │                          │                      │
     ├────────────────────►│                          │                      │
     │            createCheckoutAction                │                      │
     │            ├─ Payment(INITIATED)               │                      │
     │            │  reference = FL-PRO-MONTHLY-<companyId>-<nonce>          │
     │            ├─────────────────────────────────► │                      │
     │            │       POST /payment               │                      │
     │            │ ◄───────────────────────────────  │                      │
     │            │       payment_url                 │                      │
     │            └─ Payment(PENDING)                 │                      │
     │ ◄───────────────────┤                          │                      │
     │  redirection vers payment_url                  │                      │
     ├───────────────────────────────────────────────►│                      │
     │                     │                          ├─────────────────────►│
     │                     │                          │   push USSD / QR     │
     │                     │                          │ ◄────────────────────┤
     │                     │ ◄────────────────────────┤  paiement confirme   │
     │                     │   POST /api/webhooks/... │                      │
     │                     │                          │                      │
     │            handlePaymentWebhook                │                      │
     │            ├─ verification HMAC ──────────► 401 si invalide           │
     │            ├─ WebhookEvent.create ─────────► 200 si deja traite       │
     │            ├─ CinetPay : /payment/check (verification serveur)        │
     │            ├─ controle du montant ─────────► FAILED si insuffisant    │
     │            └─ TRANSACTION :                                            │
     │                 ancien abonnement -> EXPIRED                           │
     │                 Subscription(ACTIVE, periodEnd = +1 mois)              │
     │                 Payment(SUCCEEDED, paidAt)                             │
     │                 Notification + AuditLog                                │
     │ ◄───────────────────┤                          │                      │
     │  retour navigateur : lit l'etat, n'active rien │                      │
```

## 3. La reference de paiement, piece maitresse

```
FL-PRO-MONTHLY-clx7a9b2k0000/[nonce base36]
│  │   │        │
│  │   │        └─ identifiant de l'entreprise
│  │   └────────── cycle : MONTHLY | YEARLY
│  └────────────── palier : STARTER | PRO | PREMIUM
└───────────────── prefixe FASHLINK
```

Elle voyage jusqu'au PSP et revient dans le webhook. **Elle est auto-portante** :
meme si le webhook arrive avant que notre reponse HTTP d'initialisation soit
ecrite en base, on sait quoi activer. Aucun etat intermediaire a consulter,
donc aucune course possible.

`parsePaymentReference()` la relit avec une expression reguliere stricte ; une
reference illisible est tracee dans `WebhookEvent.error` et part en
regularisation manuelle.

## 4. Les trois garanties

### 4.1 Idempotence

`WebhookEvent` porte une contrainte `@@unique([provider, eventId])`. Le
traitement commence par `webhookEvent.create()` : si l'evenement a deja ete vu,
l'insertion echoue **avant la moindre ecriture metier** et la fonction retourne
`ALREADY_PROCESSED` avec un code `200`. Le PSP cesse de rejouer.

### 4.2 Atomicite

L'activation tient dans un seul `prisma.$transaction` : retrogradation de
l'ancien abonnement, creation du nouveau, mise a jour du paiement, notification
et journal d'audit. Une coupure a mi-chemin ne laisse jamais un recruteur avec
deux abonnements actifs ni un paiement encaisse sans droits.

### 4.3 Authenticite

| PSP | Verification |
|---|---|
| **CinetPay** | HMAC-SHA256 sur la concatenation ordonnee des champs du formulaire, compare a l'en-tete `x-token`. **Puis** appel serveur a serveur `/payment/check` : le webhook annonce, l'API confirme. Un webhook seul ne credite jamais |
| **Wave** | `Wave-Signature: t=…,v1=…`. HMAC-SHA256 sur `t.rawBody`, plus une fenetre anti-rejeu de 5 minutes |
| **MTN MoMo** | `x-signature` si `MTN_MOMO_WEBHOOK_SECRET` est defini ; sinon l'URL de callback secrete fait office de secret partage |

Toutes les comparaisons passent par `timingSafeEqual` : une comparaison
`===` sur une signature fuit sa valeur par le temps de reponse.

**Le corps brut est indispensable** : `await request.text()` avant tout parsing.
Une re-serialisation JSON reordonnerait les cles et casserait le HMAC.

## 5. Quotas et bascule Starter → Pro/Premium

| | Starter | Pro | Premium |
|---|---|---|---|
| Prix mensuel | Gratuit | 25 000 XOF | 60 000 XOF |
| Prix annuel | — | 250 000 XOF | 600 000 XOF |
| Offres actives | 1 | 10 | illimite (`-1`) |
| Mises en avant / mois | 0 | 2 | 10 |
| Comptes recruteurs | 1 | 3 | 10 |
| Recherche de talents | ❌ | ✅ | ✅ |
| Export CSV | ❌ | ✅ | ✅ |

`getEntitlements(companyId)` est la source unique de verite. **Toute entreprise
sans abonnement actif retombe sur Starter** — le compte reste utilisable, seuls
les quotas se resserrent. Laisser expirer un abonnement ne verrouille jamais un
recruteur hors de son espace ; c'est ce qui evite les demandes de support un
lundi matin.

Le quota se consomme **a la publication effective** (`approveJobAction`), pas a
la soumission : une offre rejetee ne coute rien. Il se libere a la cloture
(`closeJobAction`) et a l'expiration (cron).

## 6. Configuration des prestataires

### CinetPay — recommande par defaut

Couvre MTN, Moov, Celtiis et la carte bancaire en un seul contrat.

1. Compte marchand sur `cinetpay.com`, section Integration.
2. Relever `API_KEY`, `SITE_ID`, `SECRET_KEY`.
3. Declarer l'URL de notification :
   `https://<domaine>/api/webhooks/cinetpay`
4. Tester en sandbox avant de basculer `CINETPAY_BASE_URL` en production.

### Wave

1. Compte business, generer une cle API.
2. Declarer le webhook `https://<domaine>/api/webhooks/wave`.
3. Relever le secret de signature → `WAVE_WEBHOOK_SECRET`.

### MTN MoMo

1. Souscrire au produit *Collection* sur `momodeveloper.mtn.com`.
2. Creer l'API user et l'API key, relever la subscription key.
3. `MTN_MOMO_TARGET_ENVIRONMENT=mtnbenin` en production.
4. Particularite : **pas de page de paiement hebergee**. On declenche un push
   USSD ; `paymentUrl` renvoie vers `/recruteur/abonnement/attente` qui
   interroge `getPaymentStatusAction` jusqu'a resolution.

## 7. Optimisation mobile-first et faible bande passante

Le contexte : 3G majoritaire, forfaits data comptes, terminaux d'entree de
gamme. Chaque kilo-octet est un cout pour l'utilisateur.

### Images de portfolio

- **Upload direct navigateur → Cloudinary** via signature a duree limitee
  (`/api/uploads/signature`). Le fichier ne transite jamais par le serveur
  Next.js : pas de limite de charge utile serverless, pas de double transfert.
- **AVIF puis WebP** (`next.config.mjs`), avec repli JPEG automatique.
- `deviceSizes` demarre a **320 px** — la taille reelle des ecrans les plus
  repandus, pas 640 px comme le defaut de Next.js.
- `PortfolioItem` stocke trois URLs : l'original, une **miniature 400 px** qui
  sert toutes les listes, et un **`blurDataUrl` base64 (~1 Ko)** affiche pendant
  le chargement. Une grille de book charge des miniatures, jamais des originaux.
- `minimumCacheTTL` a 30 jours : un book change rarement.

### Charge JavaScript

- Server Components par defaut. Seuls trois composants sont `'use client'` :
  `ApplyButton`, `AdminApprovalTable` et les formulaires.
- **Aucune librairie d'icones** : `Icons.tsx` contient les traces SVG
  necessaires. Un icon pack coute 30 a 80 Ko pour une quinzaine de glyphes.
- **Aucune librairie de dates** : `Intl.RelativeTimeFormat` et
  `Intl.DateTimeFormat` sont natifs.
- Polices auto-hebergees par `next/font` : pas de requete tierce, pas de
  resolution DNS supplementaire.
- Premier chargement JS mesure : **~103 Ko partages**, ~111 Ko sur l'accueil.

### Reseau

- Liste publique en `Cache-Control: public, s-maxage=60,
  stale-while-revalidate=300` : le CDN absorbe les pics, l'utilisateur recoit
  une reponse cachee meme pendant la revalidation.
- Compteur de vues incremente **hors du chemin de rendu** (`void … .catch()`) :
  une vue perdue est sans consequence, une page lente ne l'est pas.
- Accueil et liste degradent proprement si la base est injoignable — squelettes
  et message, jamais une page d'erreur : la vitrine reste consultable.

### Interface

- Barre d'action fixe en bas d'ecran sur la page offre, avec
  `env(safe-area-inset-bottom)` : le geste du pouce plutot que le scroll.
- Tableaux admin convertis en cartes sous `lg`.
- Cibles tactiles ≥ 44 px.

## 8. Deploiement

### Vercel

`vercel.json` fixe `framework: nextjs`, `buildCommand: npm run build` et la
region **`cdg1` (Paris)** — la plus proche de l'Afrique de l'Ouest parmi les
regions Vercel, environ 40 ms de mieux que `iad1`.

**Variables d'environnement a renseigner** (voir `.env.example`) :

| Groupe | Variables |
|---|---|
| Base | `DATABASE_URL` |
| App | `NEXT_PUBLIC_APP_URL` |
| Auth | `JWT_SECRET` (48 octets, `openssl rand -base64 48`), `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL` |
| Medias | `CLOUDINARY_*`, `NEXT_PUBLIC_CLOUDINARY_*` |
| Paiement | `CINETPAY_*`, `WAVE_*`, `MTN_MOMO_*` |
| Cron | `CRON_SECRET` |

> `npm run build` fournit un `DATABASE_URL` de repli le temps du
> `prisma generate`, afin que la compilation aboutisse meme avant que la base
> soit branchee. La valeur reelle de l'environnement prend toujours le dessus.

### Base de donnees

Supabase ou Neon, **region Europe (Francfort ou Paris)**. Avec Supabase,
ajouter `directUrl = env("DIRECT_URL")` au bloc `datasource` pour que les
migrations contournent le pooler.

```bash
npx prisma migrate deploy   # migrations
npm run db:seed             # jeu de demonstration
```

### Cron

```json
{ "crons": [{ "path": "/api/cron/expire-jobs", "schedule": "0 2 * * *" }] }
```

### Verifications de mise en production

- [ ] `JWT_SECRET` genere aleatoirement, distinct de celui de developpement
- [ ] URLs de webhook declarees chez les trois PSP et testees
- [ ] Un paiement reel de bout en bout par prestataire
- [ ] Rejeu manuel d'un webhook : verifier qu'aucun second abonnement n'est cree
- [ ] `CRON_SECRET` positionne, tache planifiee visible dans Vercel
- [ ] Compte admin cree et mot de passe de seed change
- [ ] Sauvegarde automatique de la base activee
