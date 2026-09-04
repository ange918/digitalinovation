/**
 * Contenu editorial de la landing page.
 *
 * Separe de `constants.ts`, qui porte les regles metier : ici, rien n'est
 * utilise par la logique applicative. Un texte se corrige sans risque.
 */

export interface Benefit {
  title: string;
  body: string;
}

/** Ce qu'un talent gagne a entrer dans la base FASHLINK. */
export const TALENT_BENEFITS: Benefit[] = [
  {
    title: 'Un profil vu par les maisons',
    body: "Votre fiche entre dans la base consultée par les recruteurs abonnés. Ce sont eux qui vous trouvent, pas l’inverse.",
  },
  {
    title: 'Un book en ligne, pas un CV mort',
    body: 'Planches de collection, photos de défilé, pièces réalisées : votre travail se montre au lieu de se raconter.',
  },
  {
    title: 'Candidature en un clic',
    body: "Votre profil et votre CV partent ensemble. Pas de formulaire à remplir à chaque offre.",
  },
  {
    title: 'Vous savez où vous en êtes',
    body: 'Consultée, présélectionnée, entretien : chaque étape de votre candidature est visible. Fini le silence.',
  },
];

/** Ce qu'une maison gagne a publier sur FASHLINK. */
export const RECRUITER_BENEFITS: Benefit[] = [
  {
    title: 'Des candidats du secteur',
    body: "Une base entièrement dédiée à la mode. Vous ne triez plus des profils hors sujet.",
  },
  {
    title: 'Des offres vérifiées',
    body: "Chaque annonce est relue par l’équipe FASHLINK avant publication. Votre marque paraît sérieuse parce qu’elle l’est.",
  },
  {
    title: 'Un suivi lisible',
    body: 'Présélection, entretien, proposition : vos candidatures avancent par étapes, avec notes et évaluations internes.',
  },
  {
    title: 'Paiement mobile money',
    body: 'MTN, Moov, Celtiis, Wave. Votre abonnement s’active depuis votre téléphone, sans carte bancaire.',
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
    title: 'Vous créez votre compte',
    body: "Nom, e-mail, mot de passe. Trente secondes, et vous êtes dans la base.",
  },
  {
    number: '02',
    title: 'Vous complétez votre profil',
    body: 'Vos catégories parmi les six métiers, vos compétences, votre book et votre CV.',
  },
  {
    number: '03',
    title: 'Vous postulez, ou l’on vous contacte',
    body: 'Un clic sur une offre, ou une maison qui vous écrit directement via la messagerie.',
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ: FaqItem[] = [
  {
    question: 'L’inscription est-elle payante pour un talent ?',
    answer:
      "Non. Créer un profil, entrer dans la base, postuler et échanger avec les recruteurs est entièrement gratuit et le restera. Seules les maisons qui recrutent souscrivent un abonnement.",
  },
  {
    question: 'Que veulent dire MAT, PRO, DEC, ACC, IMG et COM ?',
    answer:
      "Ce sont les six familles de métiers qui structurent la plateforme : Matières & Textiles, Production & Confection, Design & Création, Accessoires & Maroquinerie, Image & Mannequinat, Communication & Vente. Vous pouvez en choisir plusieurs sur votre profil.",
  },
  {
    question: 'Combien de temps avant qu’une offre soit publiée ?',
    answer:
      "Chaque offre est relue par l’équipe FASHLINK avant sa mise en ligne. En cas de refus, vous recevez le motif précis et vous pouvez corriger puis resoumettre.",
  },
  {
    question: 'Comment se passe le paiement depuis le Bénin ?',
    answer:
      "Par mobile money : CinetPay (MTN, Moov, Celtiis et carte bancaire), Wave ou MTN MoMo en direct. Vous validez depuis votre téléphone et votre abonnement s’active automatiquement.",
  },
  {
    question: 'Puis-je résilier mon abonnement ?',
    answer:
      "Oui, à tout moment. Il n’y a aucun prélèvement automatique : votre formule court jusqu’à sa date de fin, puis votre compte revient simplement au palier Starter sans jamais être bloqué.",
  },
  {
    question: 'FASHLINK couvre-t-il d’autres pays que le Bénin ?',
    answer:
      "La plateforme est née à Cotonou et s’adresse à toute l’Afrique francophone. Les offres et les profils peuvent être publiés depuis n’importe quel pays de la zone.",
  },
];

/** Lignes du tableau comparatif des formules. */
export const PLAN_COMPARISON: {
  label: string;
  starter: string;
  pro: string;
  premium: string;
}[] = [
  { label: 'Offres actives simultanément', starter: '1', pro: '10', premium: 'Illimité' },
  { label: 'Mises en avant par mois', starter: '—', pro: '2', premium: '10' },
  { label: 'Comptes recruteurs', starter: '1', pro: '3', premium: '10' },
  { label: 'Réception des candidatures', starter: 'Oui', pro: 'Oui', premium: 'Oui' },
  { label: 'Messagerie avec les candidats', starter: 'Oui', pro: 'Oui', premium: 'Oui' },
  { label: 'Fiche entreprise publique', starter: 'Oui', pro: 'Oui', premium: 'Oui' },
  { label: 'Recherche dans la base de talents', starter: '—', pro: 'Oui', premium: 'Oui' },
  { label: 'Contact direct des talents', starter: '—', pro: '—', premium: 'Oui' },
  { label: 'Export des candidatures (CSV)', starter: '—', pro: 'Oui', premium: 'Oui' },
  { label: 'Support prioritaire Susuni Lab', starter: '—', pro: '—', premium: 'Oui' },
];
