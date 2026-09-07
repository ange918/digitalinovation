/**
 * Contenu éditorial de la landing page.
 *
 * Décrit le modèle d'intermédiation à trois interfaces :
 * 1. Utilisateurs / Talents
 * 2. Marques & Maisons de production
 * 3. Administrateur
 */

export interface Benefit {
  title: string;
  body: string;
}

/** Ce qu'un talent gagne à entrer dans la base FASHLINK. */
export const TALENT_BENEFITS: Benefit[] = [
  {
    title: 'Un profil professionnel complet',
    body: "Vos compétences clés, votre book, votre CV et vos spécialités mode sont centralisés dans une interface dédiée.",
  },
  {
    title: 'Des annonces vérifiées par l’administrateur',
    body: 'Toutes les offres publiées proviennent de vraies maisons de production et ont été validées avant publication.',
  },
  {
    title: 'Candidature directe en un clic',
    body: "Postulez avec votre profil et votre book. Aucune paperasse superflue, votre candidature part directement à l'administration.",
  },
  {
    title: 'Suivi transparent de transmission',
    body: "Vous êtes informé dès que l'administrateur analyse votre profil et lorsqu'il est transmis à la maison de production.",
  },
];

/** Ce qu'une maison gagne à publier sur FASHLINK. */
export const RECRUITER_BENEFITS: Benefit[] = [
  {
    title: 'Publication simple de vos besoins',
    body: "Exprimez précisément votre recherche : 'Je cherche 10 personnes pour mon atelier, voici les conditions requises...'.",
  },
  {
    title: 'Modération et validation rapides',
    body: "L’administrateur relit votre annonce, s'assure de sa clarté et la publie auprès de la communauté de talents.",
  },
  {
    title: 'Analyse et sélection préalables des profils',
    body: "L'administrateur reçoit les candidatures, étudie le book, le CV et les compétences avant de vous transmettre les meilleurs profils.",
  },
  {
    title: 'Mise en relation ciblée sans bruit',
    body: "Vous ne recevez que les candidats qualifiés et recommandés, prêts à rejoindre votre atelier ou votre studio.",
  },
];

export interface Step {
  number: string;
  title: string;
  body: string;
}

export const TALENT_STEPS: Step[] = [
  {
    number: '01',
    title: 'Création de compte & profil',
    body: "Nom, métier, spécialités de mode, book et CV. Votre profil est prêt en quelques instants.",
  },
  {
    number: '02',
    title: 'Consultation des offres publiées',
    body: 'Découvrez les annonces des maisons de production validées par l’administrateur FASHLINK.',
  },
  {
    number: '03',
    title: 'Candidature & transmission à la maison',
    body: "Vous postulez, l’administrateur examine votre profil puis le transmet à la maison de production pour entretien.",
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ: FaqItem[] = [
  {
    question: 'Comment fonctionnent les trois interfaces de FASHLINK ?',
    answer:
      "La plateforme s'articule autour de trois espaces : l'interface Utilisateur (pour consulter les annonces, créer son profil et postuler), l'interface Maisons de production (pour exprimer ses besoins en recrutement et recevoir des profils qualifiés), et l'interface Administrateur (pour modérer les offres, analyser les candidatures et transmettre les talents retenus aux maisons).",
  },
  {
    question: 'Que veulent dire MAT, PRO, DEC, ACC, IMG et COM ?',
    answer:
      "Ce sont les six familles de métiers qui structurent la plateforme : Matières & Fournitures (MAT), Production & Confection (PRO), Décoration & Finition (DEC), Accessoires (ACC), Image & Communication (IMG), et Commerce & Distribution (COM).",
  },
  {
    question: 'Comment une maison de production publie-t-elle une offre ?',
    answer:
      "Depuis son espace dédié, la maison renseigne le nombre de personnes recherchées, la description du projet et la liste précise des conditions. L'offre est transmise à l'administrateur qui la valide et la publie sur la plateforme.",
  },
  {
    question: 'Que se passe-t-il après qu’un utilisateur a postulé ?',
    answer:
      "L'administrateur reçoit une notification immédiate. Il examine en détail le profil du candidat (expérience, book, CV) au regard des conditions demandées par la maison. Une fois l'analyse effectuée, il transmet la fiche du candidat à la maison avec ses recommandations.",
  },
  {
    question: 'FASHLINK est-il ouvert à toute l’Afrique francophone ?',
    answer:
      "Oui. Née à Cotonou, la plateforme connecte des créateurs, ateliers et professionnels de toute la sous-région (Bénin, Côte d'Ivoire, Sénégal, Togo, etc.).",
  },
];
