# FASHLINK

**La plateforme qui relie les talents et les maisons de mode en Afrique francophone.**
Emploi, stage et missions freelance — de la matiere premiere a la communication.

Un projet **Susuni Lab** — Cotonou, Benin.

---

## Stack

| Couche | Technologie |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions, React 19) |
| Langage | TypeScript strict |
| Style | Tailwind CSS 3.4 — design system maison |
| Base de donnees | PostgreSQL via Prisma 6 |
| Medias | Cloudinary (upload direct navigateur) |
| Paiement | CinetPay · Wave · MTN Mobile Money |
| Hebergement | Vercel (region `cdg1`) |

## Demarrage

```bash
npm install
cp .env.example .env.local        # renseigner DATABASE_URL et JWT_SECRET
npx prisma migrate dev --name init
npm run db:seed                   # jeu de demonstration
npm run dev
```

L'application demarre sur <http://localhost:3000>.

### Comptes de demonstration

Mot de passe commun : `Fashlink2026`

| Role | Adresse |
|---|---|
| Admin | `admin@fashlink.africa` |
| Recruteur | `recrutement@maisonadjovi.bj` |
| Talent | `awa.kone@example.bj` |

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de developpement |
| `npm run build` | `prisma generate` puis build de production |
| `npm run typecheck` | Verification TypeScript |
| `npm run lint` | ESLint |
| `npm run prisma:migrate` | Nouvelle migration |
| `npm run prisma:studio` | Explorateur de base |
| `npm run db:seed` | Donnees de demonstration |

## Les six categories metiers

| Code | Categorie |
|---|---|
| `MAT` | Matieres & Textiles |
| `PRO` | Production & Confection |
| `DEC` | Design & Creation |
| `ACC` | Accessoires & Maroquinerie |
| `IMG` | Image & Mannequinat |
| `COM` | Communication & Vente |

> Les codes proviennent du cahier des charges ; les libelles ci-dessus sont la
> lecture retenue pour l'ecosysteme mode et **restent a valider avec Susuni Lab**
> avant mise en production. Ils sont centralises dans `src/lib/constants.ts` :
> un seul fichier a modifier.

## Structure

```
prisma/
  schema.prisma              Schema complet (14 modeles, 12 enums)
  seed.ts                    Jeu de demonstration idempotent
src/
  app/
    actions/                 Server Actions (auth, offres, candidatures,
                             moderation, abonnements)
    api/
      jobs/                  Liste publique cachable
      webhooks/              CinetPay · Wave · MTN MoMo
      cron/                  Expiration des offres et abonnements
    offres/                  Liste et detail
    admin/moderation/        File de validation
  components/
    jobs/                    JobCard · JobDetailView · ApplyButton
    admin/                   AdminApprovalTable
    ui/                      Badge · Button · CategoryTag · Icons
    layout/                  SiteHeader · SiteFooter
  lib/
    prisma.ts                Client singleton
    auth.ts                  JWT, sessions, cookies
    rbac.ts                  Gardes d'autorisation
    billing.ts               Quotas et droits
    payments/                Passerelles PSP
    subscription-activation.ts  Activation idempotente
    constants.ts             Categories, plans, transitions
  middleware.ts              Filtre d'acces peripherique
docs/
  02-architecture-api.md     Routes, endpoints, Server Actions, workflow
  03-design-system.md        Couleurs, typographie, composants
  05-paiements-deploiement.md  Mobile money, optimisation, mise en production
```

## Workflow de validation des offres

Aucune offre n'apparait publiquement sans passer par la moderation FASHLINK :

```
DRAFT ──► PENDING_VALIDATION ──► ACTIVE ──► CLOSED / EXPIRED
                    └──────────► REJECTED (motif transmis au recruteur)
```

Modifier une offre deja en ligne la renvoie en validation : le contenu publie
correspond toujours a ce que l'equipe a vu.

## Securite

- Mots de passe hashes avec bcrypt (cout 12).
- JWT HS256 signes, refresh tokens opaques stockes en SHA-256.
- Session revalidee en base a chaque requete : une suspension prend effet
  immediatement, sans attendre l'expiration du jeton.
- Autorisation refaite dans chaque Server Action ; le middleware n'est qu'un
  filtre de confort.
- Webhooks : HMAC verifie en temps constant, idempotence par contrainte unique,
  activation en transaction unique.
- Piste d'audit sur toutes les actions sensibles (`AuditLog`).

## Documentation

- [Architecture API & routes](docs/02-architecture-api.md)
- [Design system](docs/03-design-system.md)
- [Paiements & deploiement](docs/05-paiements-deploiement.md)

## Etat d'avancement

**En place** — schema de donnees complet, design system, workflow de moderation
de bout en bout, candidature en un clic, integration des trois PSP avec
activation idempotente des abonnements, liste et detail des offres, file de
moderation admin, tache d'expiration planifiee.

**A construire** — pages d'authentification, espaces talent et recruteur,
messagerie interne, annuaire des talents, upload Cloudinary, emails
transactionnels.
