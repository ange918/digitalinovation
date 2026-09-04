# FASHLINK — Design system

> Livrable 3. Configuration Tailwind : `tailwind.config.js`. Couche de base :
> `src/app/globals.css`.

## 1. Intention

Un magazine de mode, pas un tableau de bord SaaS. Trois regles gouvernent tout :

1. **Le blanc est la matiere premiere.** Les respirations valent autant que le
   contenu. Une section respire a `py-20` minimum, une carte a `p-6`.
2. **Le bleu roi est un accent, jamais un aplat.** Il ne couvre pas plus de
   ~10 % d'un ecran : bouton primaire, lien, focus, etat actif. Le bleu nuit
   porte le texte et les surfaces sombres.
3. **Le filet remplace l'ombre.** Une bordure de 1 px `#E8EAEF` definit les
   surfaces. L'ombre n'apparait qu'a l'interaction, comme une page qu'on
   souleve.

## 2. Couleurs

### Bleu roi — action (`royal`)

| Jeton | Hex | Usage |
|---|---|---|
| `royal-50` | `#EEF6FC` | Fond de tag actif, surlignage discret |
| `royal-100` | `#D6EAF7` | Selection de texte |
| `royal-200` | `#AFD5EF` | Bordure d'element actif |
| `royal-500` | **`#1A7BBF`** | **Couleur de marque** — bouton primaire, lien, focus |
| `royal-600` | `#1666A1` | Survol du bouton primaire |
| `royal-700` | `#125283` | Texte sur fond `royal-50` (contraste 7,1:1) |

### Bleu nuit — texte et surfaces sombres (`midnight`)

| Jeton | Hex | Usage |
|---|---|---|
| `midnight-900` | **`#1A2044`** | **Couleur de marque** — titres, bandeau de la page offre |
| `midnight-950` | `#11142B` | Fond de modale |
| `midnight-400` | `#6B7398` | Initiale de logo de repli |

### Fonds et texte

| Jeton | Hex | Usage |
|---|---|---|
| `canvas` | `#F9FAFB` | Fond d'application |
| `canvas-alt` | `#F8F9FA` | Survol de ligne, champ au repos |
| `canvas-warm` | `#FAFAF8` | Sections editoriales |
| `ink` | `#1A2044` | Texte principal |
| `ink-muted` | `#5B6178` | Texte secondaire |
| `ink-subtle` | `#8A8FA3` | Legendes, meta |
| `ink-faint` | `#B4B8C5` | Placeholders, icones inertes |
| `line` | `#E8EAEF` | Bordure standard |
| `line-strong` | `#D5D8E1` | Bordure au survol |
| `line-subtle` | `#F0F1F5` | Separateur interne de carte |

### Statuts

Volontairement desatures — un vert vif jurerait avec la sobriete generale.

| Ton | 50 | 500 | 700 |
|---|---|---|---|
| `success` | `#EDF7F1` | `#2E7D5B` | `#1F5B41` |
| `warning` | `#FDF6EC` | `#B57A1F` | `#8A5C13` |
| `danger` | `#FBEFEF` | `#B3453F` | `#8A322D` |

**Contrastes verifies (WCAG AA)** : `ink` sur `canvas` = 13,8:1 · `ink-muted`
sur `canvas` = 6,4:1 · blanc sur `royal-500` = 4,6:1 · `royal-700` sur
`royal-50` = 7,1:1.

## 3. Typographie

| Role | Police | Application |
|---|---|---|
| Titres forts | **DM Serif Display** 400 | `h1`, `h2`, `h3`, logotype, chiffres cles |
| Interface et corps | **Plus Jakarta Sans** 400/500/600/700 | Tout le reste |

DM Serif Display n'a qu'une graisse : l'effet vient de la **taille**, jamais du
gras. Les polices sont auto-hebergees par `next/font` — pas de requete vers
`fonts.googleapis.com` au runtime, donc pas de resolution DNS supplementaire sur
un reseau lent, et aucun decalage de mise en page.

### Echelle

| Jeton | Taille | Interlignage | Interlettrage | Usage |
|---|---|---|---|---|
| `display-xl` | 72 px | 1.02 | −0.03em | Hero d'accueil, grand ecran |
| `display-lg` | 56 px | 1.05 | −0.025em | Hero |
| `display-md` | 44 px | 1.10 | −0.02em | Titre de page |
| `display-sm` | 34 px | 1.15 | −0.015em | Titre de section |
| `title-lg` | 26 px | 1.25 | −0.01em | Titre de bloc |
| `title-md` | 20 px | 1.35 | — | Titre de carte |
| `body-lg` | 17 px | 1.70 | — | Chapo, description d'offre |
| `body` | 15 px | 1.65 | — | Corps courant |
| `body-sm` | 14 px | 1.60 | — | Interface |
| `caption` | 13 px | 1.50 | — | Meta, legende |
| `overline` | 11 px | 1.40 | **+0.14em** | Micro-label majuscule |

L'`overline` (`.fl-overline`) est la signature editoriale : il coiffe chaque
section — `SUSUNI LAB · COTONOU`, `SIX METIERS`, `FRAICHEMENT PUBLIEES`.

## 4. Espacement et grilles

Rythme base sur 4 px. Jetons ajoutes : `18` (4.5rem), `22`, `26`, `30`,
`section` (5.5rem), `section-lg` (8rem).

| Contexte | Valeur |
|---|---|
| Padding vertical de section | `py-20` mobile, `py-28` grand ecran |
| Conteneur | centre, max `1280px`, padding `1.25rem` → `4rem` |
| Grille d'offres | 1 col. mobile · 2 col. `md` · 3 col. `lg`, `gap-5` |
| Detail d'offre | `minmax(0,1fr) 320px`, `gap-16` en `lg` |
| Padding de carte | `p-5` mobile, `p-6` a partir de `sm` |
| Longueur de ligne | `max-w-prose` = **68 caracteres** |

## 5. Rayons, ombres, mouvement

```
rounded-card   0.875rem   cartes, champs, panneaux internes
rounded-panel  1.25rem    modales, encarts flottants
rounded-pill   9999px     boutons, tags, pastilles
```

Les ombres sont teintees bleu nuit (`rgba(26,32,68,…)`) et non noir pur : c'est
ce qui donne l'impression « papier glace » plutot que « web ».

```
shadow-subtle       0 1px 2px rgba(26,32,68,.04)
shadow-card         0 1px 3px rgba(26,32,68,.05), 0 8px 24px -12px rgba(26,32,68,.08)
shadow-card-hover   0 2px 6px rgba(26,32,68,.06), 0 16px 40px -16px rgba(26,32,68,.14)
shadow-panel        0 4px 12px rgba(26,32,68,.05), 0 24px 56px -24px rgba(26,32,68,.16)
shadow-royal        0 2px 8px -2px rgba(26,123,191,.4)
shadow-focus        0 0 0 3px rgba(26,123,191,.22)
```

Une seule courbe pour toute la plateforme : `ease-editorial`
(`cubic-bezier(0.22, 0.61, 0.36, 1)`) — sortie douce, sans rebond. Durees :
`150ms` pour la couleur, `250ms` pour le deplacement. `prefers-reduced-motion`
est respecte globalement dans `globals.css`.

## 6. Composants

### Carte d'offre (`JobCard`)

- **Au repos** : bordure `line`, aucune ombre. **Au survol** : `-translate-y-0.5`,
  bordure `line-strong`, `shadow-card-hover`.
- Toute la carte est cliquable via un lien etendu (`after:absolute after:inset-0`)
  — grande cible tactile sans imbriquer de liens, ce que le HTML interdit.
- Le bouton « enregistrer » remonte en `z-10` pour rester actionnable.
- Une offre a la une prend une bordure `royal-200` et un degrade `royal-50/40`
  → blanc, sans jamais devenir un aplat colore.
- Hierarchie : entreprise (14 px) → **titre serif 20 px** → meta 13 px →
  salaire 14 px semi-gras → filet → tags + fraicheur.

### Tags de categorie (`CategoryTag`)

Monochromes par choix : dans une grille de 12 offres, six couleurs de categorie
transformeraient la page en nuancier. La distinction se fait par le texte. Seul
le survol de la carte parente revele l'accent bleu roi (`group-hover:`).

Trois variantes : `code` (MAT), `short` (Matieres), `full` (Matieres & Textiles).

### Boutons

| Variante | Rendu | Usage |
|---|---|---|
| `primary` | Aplat `royal-500`, `shadow-royal` | **Une seule par ecran** |
| `secondary` | Blanc, `ring-1 ring-line-strong` | Action de second rang |
| `ghost` | Transparent | Annuler, action tertiaire |
| `danger` | Blanc, anneau rouge | Rejeter, supprimer |
| `success` | Aplat vert | Valider une offre |

Tailles `sm` (32 px), `md` (40 px), `lg` (48 px) — toutes ≥ 44 px de cible
tactile effective en comptant le padding parent sur mobile.

### Dashboards recruteur et admin

Sobres et analytiques : pas de graphique decoratif.

- **Tuiles de statistiques** : `fl-overline` en label, chiffre en
  **serif `display-sm`** avec `font-variant-numeric: tabular-nums`. La tuile
  qui appelle une action (« En attente ») prend une bordure `royal-200` et un
  fond `royal-50/50` — la seule couleur du bandeau.
- **Tableaux** : en-tetes en `overline`, lignes separees par `line-subtle`,
  survol `canvas-alt/60`. Aucune couleur de fond de ligne — la hierarchie tient
  au filet et au poids typographique.
- **Bascule mobile** : sous `lg`, le tableau devient une liste de cartes. Un
  tableau a six colonnes est illisible au pouce.
- **Ligne traitee** : elle reste affichee a `opacity-45` avec la decision prise,
  au lieu de disparaitre. L'equipe voit ce qu'elle vient de faire.

## 7. Accessibilite

- Focus visible unifie : `ring-2 ring-royal-500 ring-offset-2` sur
  `:focus-visible`, jamais supprime.
- Lien d'evitement en premiere tabulation.
- Icones decoratives en `aria-hidden`, actions icone-seule en `aria-label`.
- Bouton favori en `aria-pressed`, pagination en `aria-current="page"`.
- Modale de rejet : `role="dialog"`, `aria-modal`, `aria-labelledby`.
- Erreurs en `role="alert"`.
- Aucune information portee par la seule couleur : chaque statut associe un
  libelle a sa pastille.
