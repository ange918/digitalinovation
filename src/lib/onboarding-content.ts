/**
 * Textes des carrousels d'accueil.
 *
 * Volontairement isolés du code : corriger une formulation ne doit jamais
 * demander de toucher à un composant.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ À VALIDER — les diapositives marquées `aValider: true` sont de moi. │
 * │ Les autres reprennent les mots donnés par Susuni Lab.               │
 * └─────────────────────────────────────────────────────────────────────┘
 */

export interface Slide {
  /** Surtitre discret, en capitales espacées. */
  eyebrow?: string;
  title: string;
  body: string;
  /** Diapositive de clôture : porte l'appel à la création de compte. */
  isFinal?: boolean;
  /** Formulation ajoutée pour le rythme, en attente de validation. */
  aValider?: boolean;
}

export interface Deck {
  /** Public visé, sert au rôle pré-sélectionné à l'inscription. */
  role: 'talent' | 'recruteur';
  /** Libellé de l'appel à l'action final. */
  ctaLabel: string;
  slides: Slide[];
}

// ---------------------------------------------------------------------------
// Talents — celles et ceux qui cherchent du travail
// ---------------------------------------------------------------------------

export const TALENT_DECK: Deck = {
  role: 'talent',
  ctaLabel: 'Créer mon compte',
  slides: [
    {
      eyebrow: 'Susuni Lab · Cotonou',
      title: 'Bienvenue sur FASHLINK',
      body: "La plateforme qui relie les métiers de la mode d’Afrique francophone aux maisons qui recrutent.",
    },
    {
      title: 'Vous avez une compétence, vous aimeriez travailler',
      body: "Couture, modélisme, broderie, mannequinat, vente… Quel que soit votre métier dans la mode, votre place est ici.",
    },
    {
      eyebrow: 'Comment ça se passe',
      title: 'Les maisons passent par nous',
      body: "Une maison de mode exprime son besoin à FASHLINK. Nous vérifions la demande, nous la publions, puis nous vous mettons en relation.",
      aValider: true,
    },
    {
      eyebrow: 'Votre garantie',
      title: 'Vous êtes accompagné, pas laissé seul',
      body: "FASHLINK contractualise avec vous comme avec la maison. Vous savez pour qui vous travaillez, combien de temps, et à quelles conditions.",
      aValider: true,
    },
    {
      title: 'Créez votre compte',
      body: "Quelques informations, votre profil et vos réalisations. C’est gratuit, et ça le restera.",
      isFinal: true,
    },
  ],
};

// ---------------------------------------------------------------------------
// Maisons de mode, marques, ateliers de production
// ---------------------------------------------------------------------------

export const MAISON_DECK: Deck = {
  role: 'recruteur',
  ctaLabel: 'Créer le compte de ma maison',
  slides: [
    {
      eyebrow: 'Susuni Lab · Cotonou',
      title: 'Vous êtes à la bonne adresse',
      body: "Vous êtes une maison de mode, une marque, un professionnel du stylisme à la recherche de main-d’œuvre.",
    },
    {
      title: 'Postez votre demande',
      body: "« J’ai besoin de six stylistes pour mon atelier de production, pendant six mois. » Vous décrivez le besoin, nous nous occupons du reste.",
    },
    {
      eyebrow: 'Notre engagement',
      title: 'FASHLINK vous fournit des personnes qualifiées',
      body: "Nous recrutons, nous vérifions les profils et nous les mettons à votre disposition. Vous ne triez pas des candidatures hors sujet.",
    },
    {
      eyebrow: 'Un seul interlocuteur',
      title: 'Un contrat, pas une place de marché',
      body: "FASHLINK contractualise avec vous d’un côté et avec les intervenants de l’autre. Vous n’avez qu’un seul interlocuteur.",
      aValider: true,
    },
    {
      title: 'Créez le compte de votre maison',
      body: "Votre fiche, votre atelier, et votre première demande dans la foulée.",
      isFinal: true,
    },
  ],
};
