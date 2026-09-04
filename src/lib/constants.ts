import type {
  ApplicationStatus,
  Category,
  ExperienceLevel,
  JobStatus,
  JobType,
  PlanTier,
  WorkMode,
} from '@prisma/client';

/**
 * Les 6 categories metiers de FASHLINK.
 *
 * Le cahier des charges fixe les codes (MAT, PRO, DEC, ACC, IMG, COM) ; les
 * libelles ci-dessous sont la lecture retenue pour l'ecosysteme mode et sont
 * a valider avec Susuni Lab avant mise en production.
 */
export const CATEGORIES: Record<
  Category,
  { code: Category; label: string; short: string; description: string }
> = {
  MAT: {
    code: 'MAT',
    label: 'Matieres & Textiles',
    short: 'Matieres',
    description:
      'Sourcing de tissus, teinture, wax et bogolan, controle qualite matiere, negoce textile.',
  },
  PRO: {
    code: 'PRO',
    label: 'Production & Confection',
    short: 'Production',
    description:
      'Modelisme, patronage, coupe, couture, broderie, supervision d’atelier et industrialisation.',
  },
  DEC: {
    code: 'DEC',
    label: 'Design & Creation',
    short: 'Design',
    description:
      'Direction de collection, stylisme, illustration de mode, recherche de tendances.',
  },
  ACC: {
    code: 'ACC',
    label: 'Accessoires & Maroquinerie',
    short: 'Accessoires',
    description:
      'Maroquinerie, chaussure, bijou, chapellerie, travail du cuir et des perles.',
  },
  IMG: {
    code: 'IMG',
    label: 'Image & Mannequinat',
    short: 'Image',
    description:
      'Mannequinat, photographie, direction artistique, stylisme photo, maquillage et coiffure.',
  },
  COM: {
    code: 'COM',
    label: 'Communication & Vente',
    short: 'Communication',
    description:
      'Marketing, community management, relations presse, vente en boutique et e-commerce.',
  },
};

export const CATEGORY_ORDER: Category[] = ['MAT', 'PRO', 'DEC', 'ACC', 'IMG', 'COM'];

export const JOB_TYPES: Record<JobType, { label: string; description: string }> = {
  EMPLOI: { label: 'Emploi', description: 'Contrat a duree determinee ou indeterminee.' },
  STAGE: { label: 'Stage', description: 'Stage conventionne ou d’immersion.' },
  FREELANCE: { label: 'Freelance', description: 'Mission ponctuelle facturee a la prestation.' },
};

export const WORK_MODES: Record<WorkMode, { label: string }> = {
  SUR_SITE: { label: 'Sur site' },
  HYBRIDE: { label: 'Hybride' },
  DISTANCIEL: { label: 'A distance' },
};

export const EXPERIENCE_LEVELS: Record<ExperienceLevel, { label: string; years: string }> = {
  DEBUTANT: { label: 'Debutant', years: '0 – 1 an' },
  JUNIOR: { label: 'Junior', years: '1 – 3 ans' },
  CONFIRME: { label: 'Confirme', years: '3 – 6 ans' },
  SENIOR: { label: 'Senior', years: '6 ans et +' },
};

/** Libelles et tonalite visuelle des statuts d'offre. */
export const JOB_STATUSES: Record<
  JobStatus,
  { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' }
> = {
  DRAFT: { label: 'Brouillon', tone: 'neutral' },
  PENDING_VALIDATION: { label: 'En attente de validation', tone: 'warning' },
  ACTIVE: { label: 'En ligne', tone: 'success' },
  REJECTED: { label: 'Rejetee', tone: 'danger' },
  CLOSED: { label: 'Cloturee', tone: 'neutral' },
  EXPIRED: { label: 'Expiree', tone: 'neutral' },
  ARCHIVED: { label: 'Archivee', tone: 'neutral' },
};

/** Etapes du suivi de candidature, dans l'ordre du pipeline recruteur. */
export const APPLICATION_STATUSES: Record<
  ApplicationStatus,
  { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger'; step: number }
> = {
  SUBMITTED: { label: 'Candidature envoyee', tone: 'info', step: 1 },
  VIEWED: { label: 'Consultee', tone: 'info', step: 2 },
  SHORTLISTED: { label: 'Preselectionne', tone: 'info', step: 3 },
  INTERVIEW: { label: 'Entretien', tone: 'warning', step: 4 },
  OFFER: { label: 'Proposition', tone: 'success', step: 5 },
  HIRED: { label: 'Recrute', tone: 'success', step: 6 },
  REJECTED: { label: 'Non retenue', tone: 'danger', step: 0 },
  WITHDRAWN: { label: 'Retiree', tone: 'neutral', step: 0 },
};

/**
 * Transitions autorisees du pipeline de candidature.
 * Toute autre transition est refusee par la Server Action.
 */
export const APPLICATION_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  SUBMITTED: ['VIEWED', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  VIEWED: ['SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  SHORTLISTED: ['INTERVIEW', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW: ['OFFER', 'REJECTED', 'WITHDRAWN'],
  OFFER: ['HIRED', 'REJECTED', 'WITHDRAWN'],
  HIRED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

/**
 * Catalogue commercial de reference.
 * Sert au seed et a l'affichage de la page tarifs ; la source de verite en
 * production reste la table `Plan`.
 */
export const PLAN_CATALOG: Record<
  PlanTier,
  {
    name: string;
    priceXof: number;
    priceYearlyXof: number | null;
    jobPostQuota: number;
    featuredQuota: number;
    seatQuota: number;
    canSearchTalents: boolean;
    canExportApplications: boolean;
    hasPrioritySupport: boolean;
    pitch: string;
    features: string[];
  }
> = {
  STARTER: {
    name: 'Starter',
    priceXof: 0,
    priceYearlyXof: null,
    jobPostQuota: 1,
    featuredQuota: 0,
    seatQuota: 1,
    canSearchTalents: false,
    canExportApplications: false,
    hasPrioritySupport: false,
    pitch: 'Pour publier une premiere offre et tester la plateforme.',
    features: [
      '1 offre active a la fois',
      'Reception des candidatures',
      'Messagerie avec les candidats',
      'Fiche entreprise publique',
    ],
  },
  PRO: {
    name: 'Pro',
    priceXof: 25_000,
    priceYearlyXof: 250_000,
    jobPostQuota: 10,
    featuredQuota: 2,
    seatQuota: 3,
    canSearchTalents: true,
    canExportApplications: true,
    hasPrioritySupport: false,
    pitch: 'Pour les maisons et ateliers qui recrutent regulierement.',
    features: [
      '10 offres actives simultanement',
      '2 mises en avant par mois',
      'Recherche dans la base de talents',
      'Export des candidatures (CSV)',
      '3 comptes recruteurs',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    priceXof: 60_000,
    priceYearlyXof: 600_000,
    jobPostQuota: -1,
    featuredQuota: 10,
    seatQuota: 10,
    canSearchTalents: true,
    canExportApplications: true,
    hasPrioritySupport: true,
    pitch: 'Pour les groupes et les campagnes de recrutement continues.',
    features: [
      'Offres actives illimitees',
      '10 mises en avant par mois',
      'Recherche et contact direct des talents',
      'Export des candidatures (CSV)',
      '10 comptes recruteurs',
      'Support prioritaire et accompagnement Susuni Lab',
    ],
  },
};

/** Duree de publication par defaut d'une offre validee, en jours. */
export const JOB_PUBLICATION_DAYS = 45;

/** Taille de page par defaut des listes paginees. */
export const PAGE_SIZE = 12;
