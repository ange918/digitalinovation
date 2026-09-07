import type {
  ApplicationStatus,
  Category,
  ExperienceLevel,
  JobStatus,
  JobType,
  WorkMode,
} from '@prisma/client';

/**
 * Les 6 categories metiers de FASHLINK.
 *
 * Libelles et descriptions repris tels quels de `app/fashlink/categories.tsx`
 * du depot Susuni Lab, qui fait autorite. Toute correction doit partir de la —
 * les memes libelles servent la fiche de candidature et l'annuaire public.
 */
export const CATEGORIES: Record<
  Category,
  { code: Category; label: string; short: string; description: string }
> = {
  MAT: {
    code: 'MAT',
    label: 'Matières & Fournitures',
    short: 'Matières',
    description: 'Tissus, matières premières et fournitures pour la création.',
  },
  PRO: {
    code: 'PRO',
    label: 'Production & Confection',
    short: 'Production',
    description: 'Ateliers, couturiers et unités de confection.',
  },
  DEC: {
    code: 'DEC',
    label: 'Décoration & Finition',
    short: 'Décoration',
    description: 'Broderie, perlage, impression et finitions d’exception.',
  },
  ACC: {
    code: 'ACC',
    label: 'Accessoires',
    short: 'Accessoires',
    description: 'Bijoux, sacs, chaussures et pièces d’ornement.',
  },
  IMG: {
    code: 'IMG',
    label: 'Image & Communication',
    short: 'Image',
    description: 'Mannequins, photographes, vidéastes et créatifs digitaux.',
  },
  COM: {
    code: 'COM',
    label: 'Commerce & Distribution',
    short: 'Commerce',
    description: 'Boutiques, e-commerçants et réseaux de distribution.',
  },
};

export const CATEGORY_ORDER: Category[] = ['MAT', 'PRO', 'DEC', 'ACC', 'IMG', 'COM'];

export const CATEGORY_LABELS: Record<string, string> = {
  MAT: 'Matières & Fournitures',
  PRO: 'Production & Confection',
  DEC: 'Décoration & Finition',
  ACC: 'Accessoires',
  IMG: 'Image & Communication',
  COM: 'Commerce & Distribution',
};

export const JOB_TYPES: Record<JobType, { label: string; description: string }> = {
  EMPLOI: { label: 'Emploi', description: 'Contrat à durée déterminée ou indéterminée.' },
  STAGE: { label: 'Stage', description: 'Stage conventionné ou d’immersion.' },
  FREELANCE: { label: 'Freelance', description: 'Mission ponctuelle facturée à la prestation.' },
};

export const WORK_MODES: Record<WorkMode, { label: string }> = {
  SUR_SITE: { label: 'Sur site' },
  HYBRIDE: { label: 'Hybride' },
  DISTANCIEL: { label: 'À distance' },
};

export const EXPERIENCE_LEVELS: Record<ExperienceLevel, { label: string; years: string }> = {
  DEBUTANT: { label: 'Débutant', years: '0 – 1 an' },
  JUNIOR: { label: 'Junior', years: '1 – 3 ans' },
  CONFIRME: { label: 'Confirmé', years: '3 – 6 ans' },
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
  REJECTED: { label: 'Rejetée', tone: 'danger' },
  CLOSED: { label: 'Clôturée', tone: 'neutral' },
  EXPIRED: { label: 'Expirée', tone: 'neutral' },
  ARCHIVED: { label: 'Archivée', tone: 'neutral' },
};

/** Etapes du suivi de candidature, dans l'ordre du pipeline recruteur. */
export const APPLICATION_STATUSES: Record<
  ApplicationStatus,
  { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger'; step: number }
> = {
  SUBMITTED: { label: 'Candidature envoyée', tone: 'info', step: 1 },
  VIEWED: { label: 'Consultée', tone: 'info', step: 2 },
  SHORTLISTED: { label: 'Présélectionné', tone: 'info', step: 3 },
  INTERVIEW: { label: 'Entretien', tone: 'warning', step: 4 },
  OFFER: { label: 'Proposition', tone: 'success', step: 5 },
  HIRED: { label: 'Recruté', tone: 'success', step: 6 },
  REJECTED: { label: 'Non retenue', tone: 'danger', step: 0 },
  WITHDRAWN: { label: 'Retirée', tone: 'neutral', step: 0 },
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

/** Duree de publication par defaut d'une offre validee, en jours. */
export const JOB_PUBLICATION_DAYS = 45;

/** Taille de page par defaut des listes paginees. */
export const PAGE_SIZE = 12;
