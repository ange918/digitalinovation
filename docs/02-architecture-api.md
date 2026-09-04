# FASHLINK — Architecture API & routes (Next.js App Router)

> Livrable 2 du cahier des charges. Recense l'integralite des routes de pages,
> Route Handlers et Server Actions de la plateforme.

## Principe de repartition

| Besoin | Mecanisme | Pourquoi |
|---|---|---|
| Mutation declenchee par l'interface FASHLINK | **Server Action** | Pas d'endpoint public a securiser, validation Zod colocalisee, `revalidatePath` immediat |
| Appel entrant d'un tiers (PSP, cron, futur mobile) | **Route Handler** | Necessite une URL stable, une signature HMAC et un code HTTP explicite |
| Lecture publique cachable | **Route Handler `GET`** ou Server Component | `Cache-Control` CDN pour epargner la bande passante |

Regle constante : **toute Server Action revalide son autorisation cote serveur**
via `@/lib/rbac`. Le middleware n'est qu'un filtre de confort ; il tourne sur le
runtime Edge, ne voit pas la base, et ignore donc qu'un compte vient d'etre
suspendu.

---

## 1. Arborescence des routes de pages

```
src/app/
├── page.tsx                          Accueil (vitrine + dernieres offres)
├── offres/
│   ├── page.tsx                      Liste publique filtrable
│   └── [slug]/page.tsx               Detail d'une offre
├── talents/
│   ├── page.tsx                      Annuaire des talents      [PRO/PREMIUM]
│   └── [slug]/page.tsx               Profil public d'un talent
├── entreprises/
│   ├── page.tsx                      Annuaire des maisons
│   └── [slug]/page.tsx               Fiche entreprise + offres en cours
├── tarifs/page.tsx                   Grille Starter / Pro / Premium
├── connexion/page.tsx                Connexion
├── inscription/page.tsx              Inscription (?role=talent|recruteur)
├── mot-de-passe/
│   ├── oubli/page.tsx                Demande de reinitialisation
│   └── reset/[token]/page.tsx        Nouveau mot de passe
│
├── talent/                           [TALENT]
│   ├── page.tsx                      Tableau de bord
│   ├── profil/page.tsx               Edition du profil + categories
│   ├── portfolio/page.tsx            Gestion du book
│   ├── candidatures/page.tsx         Suivi d'etat des candidatures
│   ├── favoris/page.tsx              Offres enregistrees
│   └── messages/[[...id]]/page.tsx   Messagerie
│
├── recruteur/                        [RECRUITER]
│   ├── page.tsx                      Tableau de bord analytique
│   ├── entreprise/page.tsx           Fiche entreprise
│   ├── offres/
│   │   ├── page.tsx                  Mes offres (tous statuts)
│   │   ├── nouvelle/page.tsx         Formulaire de creation
│   │   └── [id]/
│   │       ├── page.tsx              Edition
│   │       └── candidatures/page.tsx Pipeline de candidatures
│   ├── abonnement/
│   │   ├── page.tsx                  Plan courant, quotas, historique
│   │   ├── retour/page.tsx           Retour de redirection PSP
│   │   └── attente/page.tsx          Attente MTN MoMo (polling)
│   └── messages/[[...id]]/page.tsx   Messagerie
│
├── admin/                            [ADMIN]
│   ├── page.tsx                      Vue d'ensemble
│   ├── moderation/page.tsx           File de validation des offres
│   ├── offres/[id]/page.tsx          Fiche complete avant decision
│   ├── comptes/page.tsx              Utilisateurs, suspensions
│   ├── entreprises/page.tsx          Verification des maisons
│   ├── paiements/page.tsx            Transactions et webhooks en erreur
│   └── journal/page.tsx              Piste d'audit
│
├── 403/page.tsx                      Acces refuse
└── not-found.tsx                     404
```

---

## 2. Route Handlers (`src/app/api/`)

### 2.1 Authentification

| Methode | Route | Corps | Reponse |
|---|---|---|---|
| `POST` | `/api/auth/refresh` | cookie `fl_refresh` | Nouveau couple de jetons, rotation du refresh |
| `POST` | `/api/auth/logout` | — | `204`, cookies effaces, session revoquee |
| `GET` | `/api/auth/me` | cookie `fl_session` | Utilisateur courant ou `401` |
| `GET` | `/api/auth/verify/[token]` | — | Redirection + `emailVerifiedAt` renseigne |

### 2.2 Lecture publique

| Methode | Route | Parametres | Cache |
|---|---|---|---|
| `GET` | `/api/jobs` | `q, categorie, type, mode, niveau, ville, page, tri` | `s-maxage=60, swr=300` |
| `GET` | `/api/jobs/[slug]` | — | `s-maxage=120, swr=600` |
| `GET` | `/api/companies/[slug]` | — | `s-maxage=300` |
| `GET` | `/api/talents` | `categorie, niveau, ville, page` | privee, `PRO`+ requis |

### 2.3 Medias

| Methode | Route | Role | Role fonctionnel |
|---|---|---|---|
| `POST` | `/api/uploads/signature` | TALENT, RECRUITER | Renvoie une signature Cloudinary a duree limitee ; le fichier ne transite jamais par le serveur Next.js |
| `DELETE` | `/api/uploads/[publicId]` | proprietaire | Supprime l'asset distant |

### 2.4 Webhooks de paiement — **implementes**

| Methode | Route | Verification |
|---|---|---|
| `POST` | `/api/webhooks/cinetpay` | En-tete `x-token` (HMAC-SHA256) **puis** re-verification serveur a serveur via `/payment/check` |
| `POST` | `/api/webhooks/wave` | En-tete `Wave-Signature: t=…,v1=…`, HMAC sur `t.rawBody`, fenetre anti-rejeu de 5 min |
| `POST` | `/api/webhooks/mtn-momo` | En-tete `x-signature` si `MTN_MOMO_WEBHOOK_SECRET` est defini |

Les trois routes convergent vers `handlePaymentWebhook()` puis
`applyPaymentWebhook()`.

Codes de reponse :

| Situation | Code | Raison |
|---|---|---|
| Signature invalide | `401` | Aucune ecriture, journalisation d'alerte |
| Corps illisible | `400` | Rejeu inutile |
| Evenement deja traite | `200` | Idempotence, le PSP cesse de rejouer |
| Reference inconnue / montant insuffisant | `200` | Trace dans `WebhookEvent.error`, regularisation manuelle — un `500` bouclerait sans fin |
| Panne de notre cote | `500` | Le PSP doit rejouer |

### 2.5 Taches planifiees (Vercel Cron)

| Route | Frequence | Effet |
|---|---|---|
| `GET /api/cron/expire-jobs` | `0 2 * * *` | Expire les offres echues, libere les quotas, termine les abonnements arrives a terme, notifie a J-3 |
| `GET /api/cron/digest` | `0 7 * * 1` | Digest hebdomadaire des nouvelles offres par categorie |

Protection : en-tete `Authorization: Bearer ${CRON_SECRET}`, sinon `401`.

---

## 3. Server Actions

### 3.1 `src/app/actions/auth.ts`

| Action | Entree | Regles |
|---|---|---|
| `registerAction` | email, mot de passe, nom, prenom, telephone, role, nom d'entreprise | Mot de passe : 10 caracteres, majuscule, minuscule, chiffre. Cree `Profile` ou `Company` dans la meme transaction |
| `loginAction` | email, mot de passe | Message d'erreur unique + hachage a vide sur compte inexistant : bloque l'enumeration d'adresses |
| `logoutAction` | — | Revoque la session en base puis efface les cookies |

### 3.2 `src/app/actions/jobs.ts`

| Action | Role | Regles |
|---|---|---|
| `createJobAction` | RECRUITER | `submit: true` verifie le quota via `assertCanPublishJob` ; sinon brouillon libre |
| `updateJobAction` | RECRUITER proprietaire | Modifier une offre `ACTIVE` ou `REJECTED` la **renvoie en moderation** |
| `submitJobForReviewAction` | RECRUITER proprietaire | `DRAFT` ou `REJECTED` uniquement |
| `closeJobAction` | RECRUITER proprietaire | Passe en `CLOSED` et **libere un emplacement de quota** |
| `toggleSaveJobAction` | TALENT | Bascule le favori |

### 3.3 `src/app/actions/applications.ts`

| Action | Role | Regles |
|---|---|---|
| `applyToJobAction` | TALENT | Candidature en un clic. Transaction : `Application` + `ApplicationEvent` + `applicationCount++` + notification recruteur. Unicite `(jobId, userId)` |
| `withdrawApplicationAction` | TALENT proprietaire | Decremente le compteur, refuse si l'etat est terminal |
| `updateApplicationStatusAction` | RECRUITER proprietaire, ADMIN | Verifie `APPLICATION_TRANSITIONS` ; `VIEWED` ne notifie pas le talent |

### 3.4 `src/app/actions/moderation.ts` — workflow de validation

| Action | Role | Regles |
|---|---|---|
| `approveJobAction` | ADMIN | `PENDING_VALIDATION` -> `ACTIVE`. Fixe `publishedAt`, `expiresAt` (45 j par defaut), incremente le quota **a la publication effective**, notifie, journalise |
| `rejectJobAction` | ADMIN | Motif obligatoire (10 caracteres min.), transmis au recruteur dans la notification |
| `suspendUserAction` | ADMIN | Suspend, **revoque toutes les sessions**, archive les offres du recruteur |
| `setCompanyVerifiedAction` | ADMIN | Badge « Entreprise verifiee » |

### 3.5 `src/app/actions/subscriptions.ts`

| Action | Role | Regles |
|---|---|---|
| `createCheckoutAction` | RECRUITER | Cree le `Payment` en `INITIATED` **avant** de contacter le PSP, puis ouvre la session de paiement |
| `getPaymentStatusAction` | RECRUITER proprietaire | Polling de la page d'attente MTN MoMo |
| `cancelSubscriptionAction` | RECRUITER | Coupe le renouvellement, la periode en cours va a son terme |

### 3.6 Messagerie (`src/app/actions/messages.ts`)

| Action | Role | Regles |
|---|---|---|
| `startConversationAction` | RECRUITER | Ouvre un fil rattache a une candidature |
| `sendMessageAction` | participant | Ecrit le message, met a jour `lastMessageAt`, incremente `unreadCount` des autres participants |
| `markConversationReadAction` | participant | `lastReadAt` et remise a zero du compteur |

---

## 4. Workflow de validation d'une offre

```
        recruteur                     equipe FASHLINK              public
            │                                │                       │
  createJobAction(submit:false) ──► DRAFT     │                       │
            │                                │                       │
  submitJobForReviewAction ──► PENDING_VALIDATION ──► file /admin/moderation
            │                                │                       │
            │                    approveJobAction ──► ACTIVE ────────►│ visible
            │                                │        publishedAt     │
            │                                │        expiresAt +45 j │
            │                                │                       │
            │                    rejectJobAction ──► REJECTED         │
            │◄── notification + motif         │                       │
            │                                │                       │
  updateJobAction (si ACTIVE) ──► PENDING_VALIDATION (repasse en file)
  closeJobAction ─────────────► CLOSED (libere le quota)
  cron quotidien ─────────────► EXPIRED (libere le quota)
```

Point cle : **aucune ecriture ne rend une offre publique en dehors de
`approveJobAction`**. La liste publique et l'API filtrent sur
`status: 'ACTIVE'` et `expiresAt > now()`.

---

## 5. Matrice d'autorisation

| Ressource | Visiteur | TALENT | RECRUITER | ADMIN |
|---|---|---|---|---|
| Lire une offre `ACTIVE` | ✅ | ✅ | ✅ | ✅ |
| Lire une offre non publiee | ❌ | ❌ | proprietaire | ✅ |
| Postuler | ❌ | ✅ | ❌ | ❌ |
| Creer / modifier une offre | ❌ | ❌ | proprietaire | ✅ |
| Valider / rejeter une offre | ❌ | ❌ | ❌ | ✅ |
| Voir les candidatures d'une offre | ❌ | les siennes | proprietaire | ✅ |
| Rechercher des talents | ❌ | ❌ | `PRO`+ | ✅ |
| Suspendre un compte | ❌ | ❌ | ❌ | ✅ |

---

## 6. Conventions de reponse

Les Server Actions retournent `ActionResult<T>` — jamais d'exception au client :

```ts
type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };
```

En production, Next.js masque les messages d'exception ; l'utilisateur verrait
« une erreur est survenue ». Un resultat type permet d'afficher
« Vous avez deja postule a cette offre » ou le motif de rejet exact.

Les Route Handlers suivent la convention HTTP standard, avec un corps
`{ error, details? }` en cas d'echec de validation Zod.
