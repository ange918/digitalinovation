/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';

/**
 * Instance Prisma avec repli en mémoire (mock) si PostgreSQL n'est pas joignable.
 * Conforme aux exigences d'exécution en bac à sable AI Studio.
 */

interface MockCompany {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  coverUrl: string | null;
  description: string;
  websiteUrl: string | null;
  city: string;
  country: string;
  employeeCount: string;
  isVerified: boolean;
  categories: string[];
  approvedJobsCount?: number;
  _count: { jobs: number };
}

interface MockJob {
  id: string;
  slug: string;
  title: string;
  description: string;
  missions: string[];
  requirements: string[];
  benefits: string[];
  category: string;
  secondaryCategories: string[];
  jobType: string;
  workMode: string;
  experienceLevel: string;
  city: string;
  country: string;
  salaryMinXof: number | null;
  salaryMaxXof: number | null;
  salaryPeriod: string;
  showSalary: boolean;
  durationMonths: number | null;
  isFeatured: boolean;
  status: string;
  publishedAt: Date;
  submittedAt: Date;
  reviewedAt: Date;
  expiresAt: Date | null;
  viewCount: number;
  applicationCount: number;
  deletedAt: Date | null;
  companyId: string;
  company: MockCompany;
}

const MOCK_COMPANIES: MockCompany[] = [
  {
    id: 'comp_1',
    name: 'Maison Susuni',
    slug: 'maison-susuni',
    logoUrl: null,
    coverUrl: null,
    description: 'Maison de prêt-à-porter haut de gamme valorisant les cotonnades ouest-africaines.',
    websiteUrl: 'https://susunilab.com',
    city: 'Cotonou',
    country: 'BJ',
    employeeCount: '10-50',
    isVerified: true,
    categories: ['PRO', 'DEC'],
    _count: { jobs: 2 },
  },
  {
    id: 'comp_2',
    name: 'Atelier Indigo',
    slug: 'atelier-indigo',
    logoUrl: null,
    coverUrl: null,
    description: 'Atelier de teinture indigo naturelle et de tissage artisanal.',
    websiteUrl: null,
    city: 'Porto-Novo',
    country: 'BJ',
    employeeCount: '1-10',
    isVerified: true,
    categories: ['MAT'],
    _count: { jobs: 1 },
  },
  {
    id: 'comp_3',
    name: 'Kemi Studio',
    slug: 'kemi-studio',
    logoUrl: null,
    coverUrl: null,
    description: 'Maroquinerie contemporaine combinant cuir végétal et textiles locaux.',
    websiteUrl: null,
    city: 'Cotonou',
    country: 'BJ',
    employeeCount: '1-10',
    isVerified: true,
    categories: ['ACC', 'DEC'],
    _count: { jobs: 1 },
  },
];

const MOCK_BASE_TIME = 1788739200000; // 2026-09-07T00:00:00.000Z

const MOCK_JOBS: MockJob[] = [
  {
    id: 'job_1',
    slug: 'modeliste-senior-pret-a-porter-femme',
    title: 'Modéliste senior — prêt-à-porter femme',
    description:
      "La maison recherche un ou une modéliste confirmée pour piloter le patronage de ses collections prêt-à-porter femme. Vous travaillez en lien direct avec la direction artistique, de l'esquisse au prototype validé, et encadrez deux assistants patronniers.",
    missions: [
      'Traduire les croquis de collection en patrons industrialisables',
      'Réaliser les toiles et conduire les séances d’essayage',
      'Établir les fiches techniques et les gradations',
      'Encadrer deux assistants patronniers',
    ],
    requirements: [
      'Cinq ans d’expérience minimum en modélisme',
      'Maîtrise du patronage à plat et du moulage',
      'Bonne connaissance des tissus wax et des cotons locaux',
    ],
    benefits: ['Mutuelle santé', 'Prise en charge transport'],
    category: 'PRO',
    secondaryCategories: ['DEC'],
    jobType: 'EMPLOI',
    workMode: 'SUR_SITE',
    experienceLevel: 'CONFIRME',
    city: 'Cotonou',
    country: 'BJ',
    salaryMinXof: 250000,
    salaryMaxXof: 400000,
    salaryPeriod: 'MOIS',
    showSalary: true,
    durationMonths: null,
    isFeatured: true,
    status: 'ACTIVE',
    publishedAt: new Date(MOCK_BASE_TIME - 86400000 * 2),
    submittedAt: new Date(MOCK_BASE_TIME - 86400000 * 3),
    reviewedAt: new Date(MOCK_BASE_TIME - 86400000 * 2),
    expiresAt: new Date(MOCK_BASE_TIME + 86400000 * 30),
    viewCount: 142,
    applicationCount: 8,
    deletedAt: null,
    companyId: 'comp_1',
    company: MOCK_COMPANIES[0],
  },
  {
    id: 'job_2',
    slug: 'community-manager-mode-et-lifestyle',
    title: 'Community manager mode et lifestyle',
    description:
      "Mission de six mois pour structurer la présence sociale d'une marque d'accessoires en pleine croissance. Vous définissez la ligne éditoriale, produisez les contenus et animez une communauté de 40 000 abonnés.",
    missions: [
      'Définir le calendrier éditorial mensuel',
      'Produire photos et vidéos courtes en atelier',
      'Animer la communauté et traiter les messages entrants',
      'Rendre compte des performances chaque mois',
    ],
    requirements: [
      'Portfolio de comptes mode animés',
      'Aisance en captation et montage mobile',
      'Excellente expression écrite en français',
    ],
    benefits: ['Horaires flexibles', 'Dotation produits'],
    category: 'COM',
    secondaryCategories: ['IMG'],
    jobType: 'FREELANCE',
    workMode: 'HYBRIDE',
    experienceLevel: 'JUNIOR',
    city: 'Cotonou',
    country: 'BJ',
    salaryMinXof: 150000,
    salaryMaxXof: 250000,
    salaryPeriod: 'MOIS',
    showSalary: true,
    durationMonths: 6,
    isFeatured: false,
    status: 'ACTIVE',
    publishedAt: new Date(MOCK_BASE_TIME - 86400000 * 4),
    submittedAt: new Date(MOCK_BASE_TIME - 86400000 * 5),
    reviewedAt: new Date(MOCK_BASE_TIME - 86400000 * 4),
    expiresAt: new Date(MOCK_BASE_TIME + 86400000 * 25),
    viewCount: 98,
    applicationCount: 12,
    deletedAt: null,
    companyId: 'comp_1',
    company: MOCK_COMPANIES[0],
  },
  {
    id: 'job_3',
    slug: 'stage-assistant-sourcing-textile',
    title: 'Stage — assistant sourcing textile',
    description:
      "Stage de six mois au sein du pôle matières. Vous accompagnez l'acheteuse textile dans le référencement des fournisseurs régionaux et le contrôle qualité des tissus réceptionnés.",
    missions: [
      'Constituer et tenir à jour la base fournisseurs',
      'Préparer les dossiers d’échantillonnage',
      'Participer aux contrôles qualité à réception',
    ],
    requirements: [
      'Formation en textile, mode ou logistique',
      'Rigueur et goût du terrain',
      'Notions d’anglais commercial appréciées',
    ],
    benefits: ['Indemnité de stage', 'Restauration'],
    category: 'MAT',
    secondaryCategories: [],
    jobType: 'STAGE',
    workMode: 'SUR_SITE',
    experienceLevel: 'DEBUTANT',
    city: 'Porto-Novo',
    country: 'BJ',
    salaryMinXof: 75000,
    salaryMaxXof: 100000,
    salaryPeriod: 'MOIS',
    showSalary: true,
    durationMonths: 6,
    isFeatured: false,
    status: 'ACTIVE',
    publishedAt: new Date(MOCK_BASE_TIME - 86400000 * 6),
    submittedAt: new Date(MOCK_BASE_TIME - 86400000 * 7),
    reviewedAt: new Date(MOCK_BASE_TIME - 86400000 * 6),
    expiresAt: new Date(MOCK_BASE_TIME + 86400000 * 20),
    viewCount: 64,
    applicationCount: 5,
    deletedAt: null,
    companyId: 'comp_2',
    company: MOCK_COMPANIES[1],
  },
  {
    id: 'job_4',
    slug: 'maroquinier-petite-serie',
    title: 'Maroquinier — petite série',
    description:
      "Atelier de maroquinerie recherche un artisan confirmé pour la fabrication de sacs en petite série. Travail du cuir végétal et des tissus traditionnels, du prototype à la série de trente pièces.",
    missions: [
      'Réaliser prototypes et séries courtes',
      'Assurer la coupe, le montage et les finitions',
      'Participer à l’amélioration des gabarits',
    ],
    requirements: [
      'Trois ans d’expérience en maroquinerie',
      'Maîtrise de la couture selle et de la machine à bras',
    ],
    benefits: ['Prime sur objectif', 'Équipement fourni'],
    category: 'ACC',
    secondaryCategories: ['PRO'],
    jobType: 'EMPLOI',
    workMode: 'SUR_SITE',
    experienceLevel: 'CONFIRME',
    city: 'Abomey-Calavi',
    country: 'BJ',
    salaryMinXof: 180000,
    salaryMaxXof: 260000,
    salaryPeriod: 'MOIS',
    showSalary: true,
    durationMonths: null,
    isFeatured: false,
    status: 'ACTIVE',
    publishedAt: new Date(MOCK_BASE_TIME - 86400000 * 8),
    submittedAt: new Date(MOCK_BASE_TIME - 86400000 * 9),
    reviewedAt: new Date(MOCK_BASE_TIME - 86400000 * 8),
    expiresAt: new Date(MOCK_BASE_TIME + 86400000 * 15),
    viewCount: 110,
    applicationCount: 7,
    deletedAt: null,
    companyId: 'comp_3',
    company: MOCK_COMPANIES[2],
  },
  {
    id: 'job_5',
    slug: 'directeur-artistique-campagne-collection-ss26',
    title: 'Directeur artistique — campagne collection SS26',
    description:
      "Mission de trois mois pour concevoir et diriger la campagne visuelle de la collection printemps-été 2026 : moodboard, casting, direction de shooting et livraison des assets.",
    missions: [
      'Construire la direction artistique de la campagne',
      'Piloter le casting mannequins et l’équipe de production',
      'Diriger les prises de vue studio et extérieur',
      'Livrer les déclinaisons print et réseaux sociaux',
    ],
    requirements: [
      'Portfolio de campagnes mode dirigées',
      'Expérience de la direction d’équipe en shooting',
    ],
    benefits: ['Budget de production dédié'],
    category: 'IMG',
    secondaryCategories: ['DEC', 'COM'],
    jobType: 'FREELANCE',
    workMode: 'SUR_SITE',
    experienceLevel: 'CONFIRME',
    city: 'Cotonou',
    country: 'BJ',
    salaryMinXof: 350000,
    salaryMaxXof: 500000,
    salaryPeriod: 'MISSION',
    showSalary: true,
    durationMonths: 3,
    isFeatured: true,
    status: 'ACTIVE',
    publishedAt: new Date(MOCK_BASE_TIME - 86400000 * 1),
    submittedAt: new Date(MOCK_BASE_TIME - 86400000 * 2),
    reviewedAt: new Date(MOCK_BASE_TIME - 86400000 * 1),
    expiresAt: new Date(MOCK_BASE_TIME + 86400000 * 45),
    viewCount: 230,
    applicationCount: 19,
    deletedAt: null,
    companyId: 'comp_1',
    company: MOCK_COMPANIES[0],
  },
  {
    id: 'job_6',
    slug: 'styliste-junior-collections-capsule',
    title: 'Styliste junior — collections capsule',
    description:
      "Rejoignez le studio de création pour participer au développement de deux collections capsule par an, de la recherche de tendances à la validation des prototypes.",
    missions: [
      'Réaliser les planches de tendance et de couleur',
      'Dessiner les silhouettes et les fiches produit',
      'Suivre le développement avec l’atelier',
    ],
    requirements: [
      'Diplôme en stylisme ou design de mode',
      'Maîtrise d’Illustrator et de la retouche photo',
      'Une première expérience, stage inclus',
    ],
    benefits: ['Accès matériels et ateliers', 'Formation continue'],
    category: 'DEC',
    secondaryCategories: ['MAT'],
    jobType: 'EMPLOI',
    workMode: 'SUR_SITE',
    experienceLevel: 'JUNIOR',
    city: 'Cotonou',
    country: 'BJ',
    salaryMinXof: 150000,
    salaryMaxXof: 200000,
    salaryPeriod: 'MOIS',
    showSalary: true,
    durationMonths: null,
    isFeatured: false,
    status: 'ACTIVE',
    publishedAt: new Date(MOCK_BASE_TIME - 86400000 * 3),
    submittedAt: new Date(MOCK_BASE_TIME - 86400000 * 4),
    reviewedAt: new Date(MOCK_BASE_TIME - 86400000 * 3),
    expiresAt: new Date(MOCK_BASE_TIME + 86400000 * 35),
    viewCount: 155,
    applicationCount: 14,
    deletedAt: null,
    companyId: 'comp_1',
    company: MOCK_COMPANIES[0],
  },
  {
    id: 'job_pending_1',
    slug: 'recherche-10-personnes-atelier-confection-capsule',
    title: '10 Couturiers & Assembleurs — Atelier Confection Capsule',
    description:
      'Je cherche 10 personnes qui vont travailler pour moi dans ma maison de production. Voici les conditions : expérience de 2 ans minimum en atelier, maîtrise des piqueuses plates et surjeteuses industrielles, disponibilité immédiate pour une production capsule de trois mois.',
    missions: [
      'Assembler les pièces coupées selon le dossier technique',
      'Maîtriser les surjets et coutures anglaises',
      'Assurer le respect des cadences de production d’atelier',
      'Participer au contrôle qualité avant repassage',
    ],
    requirements: [
      'Expérience confirmée de 2 ans en atelier de confection',
      'Maîtrise des piqueuses industrielles (piqueuse plate, surjeteuse 4 fils)',
      'Disponibilité immédiate pour une mission de 3 mois',
      'Sens de la précision et travail en équipe',
    ],
    benefits: ['Indemnité de transport', 'Prime d’efficacité atelier', 'Cadre de travail climatisé'],
    category: 'PRO',
    secondaryCategories: ['MAT', 'DEC'],
    jobType: 'EMPLOI',
    workMode: 'SUR_SITE',
    experienceLevel: 'JUNIOR',
    city: 'Cotonou',
    country: 'BJ',
    salaryMinXof: 120000,
    salaryMaxXof: 180000,
    salaryPeriod: 'MOIS',
    showSalary: true,
    durationMonths: 3,
    isFeatured: false,
    status: 'PENDING_VALIDATION',
    publishedAt: null,
    submittedAt: new Date(MOCK_BASE_TIME - 3600000 * 4),
    reviewedAt: null,
    expiresAt: new Date(MOCK_BASE_TIME + 86400000 * 45),
    viewCount: 42,
    applicationCount: 2,
    deletedAt: null,
    companyId: 'comp_1',
    company: MOCK_COMPANIES[0],
  },
];

export interface MockProfile {
  id: string;
  userId: string;
  slug: string;
  headline: string;
  bio: string;
  categories: string[];
  experienceLevel: string;
  skills: string[];
  city: string;
  country: string;
  openToWork: boolean;
  resumeUrl: string | null;
  portfolioUrl: string | null;
}

export const MOCK_PROFILES: MockProfile[] = [
  {
    id: 'prof_1',
    userId: 'user_talent',
    slug: 'awa-kone',
    headline: 'Modéliste & Patronnière senior — prêt-à-porter femme',
    bio: 'Sept ans d’expérience en atelier entre Cotonou et Abidjan. Spécialisée en patronage à plat, moulage haute couture et industrialisation de séries wax et lin.',
    categories: ['PRO', 'DEC'],
    experienceLevel: 'CONFIRME',
    skills: ['Patronage à plat', 'Moulage', 'Gradation industrielle', 'Fiches techniques', 'Piqueuse plate', 'Wax & Lin'],
    city: 'Cotonou',
    country: 'BJ',
    openToWork: true,
    resumeUrl: 'https://fashlink.bj/cv/awa-kone.pdf',
    portfolioUrl: 'https://instagram.com/awakone_couture',
  },
  {
    id: 'prof_2',
    userId: 'user_talent_2',
    slug: 'aminata-toure',
    headline: 'Couturière d’atelier & mécanicienne en confection',
    bio: '4 ans d’expérience en atelier de production textile. Polyvalente sur piqueuses industrielles et surjeteuses, habituée aux petites et moyennes séries.',
    categories: ['PRO', 'MAT'],
    experienceLevel: 'JUNIOR',
    skills: ['Surjeteuse 4 fils', 'Piqueuse plate', 'Montage manches', 'Pose fermetures éclairs', 'Contrôle qualité'],
    city: 'Cotonou',
    country: 'BJ',
    openToWork: true,
    resumeUrl: 'https://fashlink.bj/cv/aminata-toure.pdf',
    portfolioUrl: null,
  },
];

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'ADMIN' | 'RECRUITER' | 'TALENT';
  status: 'ACTIVE' | 'SUSPENDED';
  companyId?: string;
  company?: any;
  profile?: any;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: 'user_admin',
    email: 'admin@fashlink.bj',
    firstName: 'Aïcha',
    lastName: 'Soglo',
    phone: '+229 97 00 00 01',
    role: 'ADMIN',
    status: 'ACTIVE',
  },
  {
    id: 'user_recruiter',
    email: 'contact@maisonadjovi.bj',
    firstName: 'Koffi',
    lastName: 'Adjovi',
    phone: '+229 97 00 00 02',
    role: 'RECRUITER',
    status: 'ACTIVE',
    companyId: 'comp_1',
    company: MOCK_COMPANIES[0],
  },
  {
    id: 'user_talent',
    email: 'awa.kone@example.bj',
    firstName: 'Awa',
    lastName: 'Koné',
    phone: '+229 97 00 00 03',
    role: 'TALENT',
    status: 'ACTIVE',
    profile: MOCK_PROFILES[0],
  },
  {
    id: 'user_talent_2',
    email: 'aminata.toure@example.bj',
    firstName: 'Aminata',
    lastName: 'Touré',
    phone: '+229 96 11 22 33',
    role: 'TALENT',
    status: 'ACTIVE',
    profile: MOCK_PROFILES[1],
  },
];

export interface MockApplication {
  id: string;
  jobId: string;
  userId: string;
  status: 'SUBMITTED' | 'VIEWED' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED';
  coverLetter?: string | null;
  resumeUrlSnapshot?: string | null;
  recruiterNote?: string | null;
  rating?: number | null;
  viewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  job?: any;
  user?: any;
}

export const MOCK_APPLICATIONS: MockApplication[] = [
  {
    id: 'app_1',
    jobId: 'job_1',
    userId: 'user_talent',
    status: 'SUBMITTED',
    coverLetter:
      "Bonjour, modéliste expérimentée avec 7 années de pratique d'atelier, je souhaite intégrer votre équipe pour sublimer vos collections prêt-à-porter femme.",
    resumeUrlSnapshot: 'https://fashlink.bj/cv/awa-kone.pdf',
    recruiterNote: null,
    rating: null,
    viewedAt: null,
    createdAt: new Date(MOCK_BASE_TIME - 3600000 * 18),
    updatedAt: new Date(MOCK_BASE_TIME - 3600000 * 18),
  },
  {
    id: 'app_2',
    jobId: 'job_pending_1',
    userId: 'user_talent_2',
    status: 'SHORTLISTED',
    coverLetter:
      "Bonjour, j'ai 4 ans d'expérience sur machines industrielles en atelier de confection. Je réponds entièrement à vos conditions et suis disponible immédiatement.",
    resumeUrlSnapshot: 'https://fashlink.bj/cv/aminata-toure.pdf',
    recruiterNote:
      "Profil minutieusement analysé par l'administrateur FASHLINK. Excellente maîtrise des piqueuses plates et surjeteuses, candidate recommandée pour votre atelier.",
    rating: 5,
    viewedAt: new Date(MOCK_BASE_TIME - 3600000 * 2),
    createdAt: new Date(MOCK_BASE_TIME - 3600000 * 6),
    updatedAt: new Date(MOCK_BASE_TIME - 3600000 * 2),
  },
];

function handleMockQuery(model: string, action: string, args: any): any {
  if (model === 'job') {
    if (action === 'findMany') {
      let filtered = [...MOCK_JOBS];
      const where = args?.where;
      if (where?.status) {
        if (typeof where.status === 'string') {
          filtered = filtered.filter((j) => j.status === where.status);
        } else if (where.status?.in) {
          filtered = filtered.filter((j) => where.status.in.includes(j.status));
        }
      }
      if (where?.companyId) {
        filtered = filtered.filter((j) => j.companyId === where.companyId);
      }
      if (where?.jobType) {
        filtered = filtered.filter((j) => j.jobType === where.jobType);
      }
      if (where?.category) {
        filtered = filtered.filter(
          (j) => j.category === where.category || j.secondaryCategories.includes(where.category),
        );
      }
      const skip = args?.skip ?? 0;
      const take = args?.take ?? filtered.length;
      return filtered.slice(skip, skip + take);
    }
    if (action === 'count') {
      const where = args?.where;
      if (where?.status === 'PENDING_VALIDATION') {
        return MOCK_JOBS.filter((j) => j.status === 'PENDING_VALIDATION').length;
      }
      if (where?.status === 'ACTIVE') {
        return MOCK_JOBS.filter((j) => j.status === 'ACTIVE').length;
      }
      return MOCK_JOBS.length;
    }
    if (action === 'findFirst' || action === 'findUnique') {
      const slug = args?.where?.slug;
      const id = args?.where?.id;
      const found = MOCK_JOBS.find((j) => (slug && j.slug === slug) || (id && j.id === id));
      if (found) return found;
      if (args?.where?.status === 'ACTIVE') {
        return MOCK_JOBS.find((j) => j.status === 'ACTIVE') || MOCK_JOBS[0];
      }
      return MOCK_JOBS[0];
    }
    if (action === 'create') {
      const newJob: MockJob = {
        id: `job_${Date.now()}`,
        slug: args?.data?.slug || `offre-${Date.now()}`,
        title: args?.data?.title || 'Nouvelle offre de recrutement',
        description: args?.data?.description || '',
        missions: args?.data?.missions || [],
        requirements: args?.data?.requirements || [],
        benefits: args?.data?.benefits || [],
        category: args?.data?.category || 'PRO',
        secondaryCategories: args?.data?.secondaryCategories || [],
        jobType: args?.data?.jobType || 'EMPLOI',
        workMode: args?.data?.workMode || 'SUR_SITE',
        experienceLevel: args?.data?.experienceLevel || 'JUNIOR',
        city: args?.data?.city || 'Cotonou',
        country: args?.data?.country || 'BJ',
        salaryMinXof: args?.data?.salaryMinXof ?? null,
        salaryMaxXof: args?.data?.salaryMaxXof ?? null,
        salaryPeriod: args?.data?.salaryPeriod || 'MOIS',
        showSalary: args?.data?.showSalary ?? true,
        durationMonths: args?.data?.durationMonths ?? null,
        isFeatured: args?.data?.isFeatured ?? false,
        status: args?.data?.status || 'PENDING_VALIDATION',
        publishedAt: args?.data?.status === 'ACTIVE' ? new Date() : null,
        submittedAt: new Date(),
        reviewedAt: null,
        expiresAt: new Date(Date.now() + 86400000 * 45),
        viewCount: 0,
        applicationCount: 0,
        deletedAt: null,
        companyId: args?.data?.companyId || 'comp_1',
        company: MOCK_COMPANIES.find((c) => c.id === args?.data?.companyId) || MOCK_COMPANIES[0],
      };
      MOCK_JOBS.unshift(newJob);
      return newJob;
    }
    if (action === 'update') {
      const id = args?.where?.id;
      const job = MOCK_JOBS.find((j) => j.id === id);
      if (job) {
        Object.assign(job, args?.data);
        return job;
      }
      return { id: id || 'job_mock', ...args?.data };
    }
  }

  if (model === 'company') {
    if (action === 'findMany') return MOCK_COMPANIES;
    if (action === 'count') return MOCK_COMPANIES.length;
    if (action === 'findFirst' || action === 'findUnique') {
      const slug = args?.where?.slug;
      const id = args?.where?.id;
      const userId = args?.where?.userId;
      return (
        MOCK_COMPANIES.find(
          (c) => (slug && c.slug === slug) || (id && c.id === id) || (userId && c.userId === userId),
        ) ?? MOCK_COMPANIES[0]
      );
    }
    if (action === 'update') {
      const id = args?.where?.id;
      const comp = MOCK_COMPANIES.find((c) => c.id === id);
      if (comp) Object.assign(comp, args?.data);
      return comp || { id: id || 'comp_1', ...args?.data };
    }
  }

  if (model === 'user') {
    if (action === 'findFirst' || action === 'findUnique') {
      const id = args?.where?.id;
      const email = args?.where?.email;
      const user = MOCK_USERS.find((u) => (id && u.id === id) || (email && u.email === email));
      if (user) {
        return {
          ...user,
          company: user.role === 'RECRUITER' ? MOCK_COMPANIES[0] : null,
          profile: user.role === 'TALENT' ? MOCK_PROFILES.find((p) => p.userId === user.id) || MOCK_PROFILES[0] : null,
        };
      }
      return null;
    }
    if (action === 'findMany') return MOCK_USERS;
    if (action === 'count') return MOCK_USERS.length;
    if (action === 'create') {
      const newUser: MockUser = {
        id: `user_${Date.now()}`,
        email: args?.data?.email || 'user@example.com',
        firstName: args?.data?.firstName || 'Utilisateur',
        lastName: args?.data?.lastName || '',
        phone: args?.data?.phone || '',
        role: args?.data?.role || 'TALENT',
        status: 'ACTIVE',
      };
      MOCK_USERS.push(newUser);
      return newUser;
    }
  }

  if (model === 'profile') {
    if (action === 'findFirst' || action === 'findUnique') {
      const userId = args?.where?.userId;
      const id = args?.where?.id;
      return MOCK_PROFILES.find((p) => (userId && p.userId === userId) || (id && p.id === id)) || MOCK_PROFILES[0];
    }
    if (action === 'update') {
      const userId = args?.where?.userId;
      const prof = MOCK_PROFILES.find((p) => (userId && p.userId === userId) || p.id === args?.where?.id);
      if (prof) {
        Object.assign(prof, args?.data);
        return prof;
      }
      return { id: 'prof_1', ...args?.data };
    }
  }

  if (model === 'application') {
    const hydrateApp = (app: MockApplication) => {
      const job = MOCK_JOBS.find((j) => j.id === app.jobId) || MOCK_JOBS[0];
      const user = MOCK_USERS.find((u) => u.id === app.userId) || MOCK_USERS[2];
      const profile = MOCK_PROFILES.find((p) => p.userId === app.userId) || MOCK_PROFILES[0];
      return {
        ...app,
        job: {
          ...job,
          company: job.company || MOCK_COMPANIES[0],
        },
        user: {
          ...user,
          profile,
        },
      };
    };

    if (action === 'findMany') {
      let apps = [...MOCK_APPLICATIONS];
      const where = args?.where;
      if (where?.userId) {
        apps = apps.filter((a) => a.userId === where.userId);
      }
      if (where?.jobId) {
        apps = apps.filter((a) => a.jobId === where.jobId);
      }
      if (where?.status) {
        if (typeof where.status === 'string') {
          apps = apps.filter((a) => a.status === where.status);
        } else if (where.status?.in) {
          apps = apps.filter((a) => where.status.in.includes(a.status));
        }
      }
      return apps.map(hydrateApp);
    }
    if (action === 'findFirst' || action === 'findUnique') {
      const id = args?.where?.id;
      const jobId = args?.where?.jobId_userId?.jobId || args?.where?.jobId;
      const userId = args?.where?.jobId_userId?.userId || args?.where?.userId;
      const found = MOCK_APPLICATIONS.find(
        (a) => (id && a.id === id) || (jobId && userId && a.jobId === jobId && a.userId === userId),
      );
      return found ? hydrateApp(found) : null;
    }
    if (action === 'count') {
      return MOCK_APPLICATIONS.length;
    }
    if (action === 'create') {
      const newApp: MockApplication = {
        id: `app_${Date.now()}`,
        jobId: args?.data?.jobId,
        userId: args?.data?.userId,
        status: args?.data?.status || 'SUBMITTED',
        coverLetter: args?.data?.coverLetter || null,
        resumeUrlSnapshot: args?.data?.resumeUrlSnapshot || null,
        recruiterNote: null,
        rating: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_APPLICATIONS.unshift(newApp);
      return hydrateApp(newApp);
    }
    if (action === 'update') {
      const id = args?.where?.id;
      const app = MOCK_APPLICATIONS.find((a) => a.id === id);
      if (app) {
        Object.assign(app, args?.data, { updatedAt: new Date() });
        return hydrateApp(app);
      }
      return { id: id || 'app_mock', ...args?.data };
    }
  }

  if (model === 'notification' || model === 'auditLog' || model === 'applicationEvent') {
    return { id: `item_${Date.now()}`, createdAt: new Date(), ...args?.data };
  }

  if (action === 'findMany') return [];
  if (action === 'count') return 0;
  if (action === 'findFirst' || action === 'findUnique') return null;
  return args?.data ?? {};
}

function createModelHandler(realModel: any, modelName: string) {
  return new Proxy(realModel || {}, {
    get(target, propKey) {
      if (typeof propKey !== 'string') return target[propKey];
      const originalMethod = target[propKey];

      return async function (...args: any[]) {
        try {
          if (typeof originalMethod === 'function') {
            return await originalMethod.apply(target, args);
          }
        } catch (err: any) {
          // Si PostgreSQL est hors-ligne ou inaccessible, on bascule gracieusement sur les données de démonstration
          console.warn(
            `[AI Studio / Prisma] Base de données indisponible (${err?.message?.slice(0, 80)}...). Repli sur les données de démonstration pour ${modelName}.${propKey}`,
          );
          return handleMockQuery(modelName, propKey, args[0]);
        }
        return handleMockQuery(modelName, propKey, args[0]);
      };
    },
  });
}

const globalForPrisma = globalThis as unknown as {
  prismaClientInstance: PrismaClient | undefined;
};

let rawPrisma: PrismaClient;
try {
  rawPrisma =
    globalForPrisma.prismaClientInstance ??
    new PrismaClient({
      log: ['error'],
    });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prismaClientInstance = rawPrisma;
  }
} catch {
  console.warn('[AI Studio] Impossible d’initialiser PrismaClient — bascule intégrale sur mock');
  rawPrisma = {} as any;
}

export const prisma = new Proxy(rawPrisma, {
  get(target, propKey) {
    if (typeof propKey !== 'string') return (target as any)[propKey];
    if (propKey in target) {
      const val = (target as any)[propKey];
      if (typeof val === 'object' && val !== null) {
        return createModelHandler(val, propKey);
      }
      return val;
    }
    return createModelHandler({}, propKey);
  },
}) as PrismaClient;
