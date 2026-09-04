/**
 * Jeu de donnees de demonstration FASHLINK.
 * Idempotent : `npm run db:seed` peut etre relance sans dupliquer.
 */
import { PrismaClient, type Category, type JobType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PLANS = [
  {
    tier: 'STARTER' as const,
    name: 'Starter',
    description: 'Pour publier une premiere offre et tester la plateforme.',
    priceXof: 0,
    priceYearlyXof: null,
    jobPostQuota: 1,
    featuredQuota: 0,
    seatQuota: 1,
    canSearchTalents: false,
    canExportApplications: false,
    hasPrioritySupport: false,
  },
  {
    tier: 'PRO' as const,
    name: 'Pro',
    description: 'Pour les maisons et ateliers qui recrutent regulierement.',
    priceXof: 25_000,
    priceYearlyXof: 250_000,
    jobPostQuota: 10,
    featuredQuota: 2,
    seatQuota: 3,
    canSearchTalents: true,
    canExportApplications: true,
    hasPrioritySupport: false,
  },
  {
    tier: 'PREMIUM' as const,
    name: 'Premium',
    description: 'Pour les groupes et les campagnes de recrutement continues.',
    priceXof: 60_000,
    priceYearlyXof: 600_000,
    jobPostQuota: -1,
    featuredQuota: 10,
    seatQuota: 10,
    canSearchTalents: true,
    canExportApplications: true,
    hasPrioritySupport: true,
  },
];

const JOBS: {
  title: string;
  category: Category;
  secondary: Category[];
  jobType: JobType;
  city: string;
  description: string;
  missions: string[];
  requirements: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  featured: boolean;
}[] = [
  {
    title: 'Modeliste senior — pret-a-porter femme',
    category: 'PRO',
    secondary: ['DEC'],
    jobType: 'EMPLOI',
    city: 'Cotonou',
    description:
      "La maison recherche un ou une modeliste confirmee pour piloter le patronage de ses collections pret-a-porter femme. Vous travaillez en lien direct avec la direction artistique, de l'esquisse au prototype valide, et encadrez deux assistants patronniers.",
    missions: [
      'Traduire les croquis de collection en patrons industrialisables',
      'Realiser les toiles et conduire les seances d’essayage',
      'Etablir les fiches techniques et les gradations',
      'Encadrer deux assistants patronniers',
    ],
    requirements: [
      'Cinq ans d’experience minimum en modelisme',
      'Maitrise du patronage a plat et du moulage',
      'Bonne connaissance des tissus wax et des cotons locaux',
    ],
    salaryMin: 250_000,
    salaryMax: 400_000,
    featured: true,
  },
  {
    title: 'Community manager mode et lifestyle',
    category: 'COM',
    secondary: ['IMG'],
    jobType: 'FREELANCE',
    city: 'Cotonou',
    description:
      "Mission de six mois pour structurer la presence sociale d'une marque d'accessoires en pleine croissance. Vous definissez la ligne editoriale, produisez les contenus et animez une communaute de 40 000 abonnes.",
    missions: [
      'Definir le calendrier editorial mensuel',
      'Produire photos et videos courtes en atelier',
      'Animer la communaute et traiter les messages entrants',
      'Rendre compte des performances chaque mois',
    ],
    requirements: [
      'Portfolio de comptes mode animes',
      'Aisance en captation et montage mobile',
      'Excellente expression ecrite en francais',
    ],
    salaryMin: 30_000,
    salaryMax: 45_000,
    featured: false,
  },
  {
    title: 'Stage — assistant sourcing textile',
    category: 'MAT',
    secondary: [],
    jobType: 'STAGE',
    city: 'Porto-Novo',
    description:
      "Stage de six mois au sein du pole matieres. Vous accompagnez l'acheteuse textile dans le referencement des fournisseurs regionaux et le controle qualite des tissus receptionnes.",
    missions: [
      'Constituer et tenir a jour la base fournisseurs',
      'Preparer les dossiers d’echantillonnage',
      'Participer aux controles qualite a reception',
    ],
    requirements: [
      'Formation en textile, mode ou logistique',
      'Rigueur et gout du terrain',
      'Notions d’anglais commercial appreciees',
    ],
    salaryMin: 75_000,
    salaryMax: null,
    featured: false,
  },
  {
    title: 'Maroquinier — petite serie',
    category: 'ACC',
    secondary: ['PRO'],
    jobType: 'EMPLOI',
    city: 'Abomey-Calavi',
    description:
      "Atelier de maroquinerie recherche un artisan confirme pour la fabrication de sacs en petite serie. Travail du cuir vegetal et des tissus traditionnels, du prototype a la serie de trente pieces.",
    missions: [
      'Realiser prototypes et series courtes',
      'Assurer la coupe, le montage et les finitions',
      'Participer a l’amelioration des gabarits',
    ],
    requirements: [
      'Trois ans d’experience en maroquinerie',
      'Maitrise de la couture selle et de la machine a bras',
    ],
    salaryMin: 180_000,
    salaryMax: 260_000,
    featured: false,
  },
  {
    title: 'Directeur artistique — campagne collection SS26',
    category: 'IMG',
    secondary: ['DEC', 'COM'],
    jobType: 'FREELANCE',
    city: 'Cotonou',
    description:
      "Mission de trois mois pour concevoir et diriger la campagne visuelle de la collection printemps-ete 2026 : moodboard, casting, direction de shooting et livraison des assets.",
    missions: [
      'Construire la direction artistique de la campagne',
      'Piloter le casting mannequins et l’equipe de production',
      'Diriger les prises de vue studio et exterieur',
      'Livrer les declinaisons print et reseaux sociaux',
    ],
    requirements: [
      'Portfolio de campagnes mode dirigees',
      'Experience de la direction d’equipe en shooting',
    ],
    salaryMin: 120_000,
    salaryMax: 180_000,
    featured: true,
  },
  {
    title: 'Styliste junior — collections capsule',
    category: 'DEC',
    secondary: ['MAT'],
    jobType: 'EMPLOI',
    city: 'Cotonou',
    description:
      "Rejoignez le studio de creation pour participer au developpement de deux collections capsule par an, de la recherche de tendances a la validation des prototypes.",
    missions: [
      'Realiser les planches de tendance et de couleur',
      'Dessiner les silhouettes et les fiches produit',
      'Suivre le developpement avec l’atelier',
    ],
    requirements: [
      'Diplome en stylisme ou design de mode',
      'Maitrise d’Illustrator et de la retouche photo',
      'Une premiere experience, stage inclus',
    ],
    salaryMin: 150_000,
    salaryMax: 200_000,
    featured: false,
  },
];

async function main() {
  console.log('Seed FASHLINK — demarrage');

  // --- Plans ---------------------------------------------------------------
  for (const plan of PLANS) {
    await prisma.plan.upsert({
      where: { tier: plan.tier },
      update: plan,
      create: plan,
    });
  }
  console.log(`  ${PLANS.length} plans en place`);

  const password = await bcrypt.hash('Fashlink2026', 12);

  // --- Admin ---------------------------------------------------------------
  await prisma.user.upsert({
    where: { email: 'admin@fashlink.africa' },
    update: {},
    create: {
      email: 'admin@fashlink.africa',
      passwordHash: password,
      firstName: 'Equipe',
      lastName: 'FASHLINK',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });

  // --- Recruteur + entreprise ---------------------------------------------
  const recruiter = await prisma.user.upsert({
    where: { email: 'recrutement@maisonadjovi.bj' },
    update: {},
    create: {
      email: 'recrutement@maisonadjovi.bj',
      passwordHash: password,
      firstName: 'Sylvie',
      lastName: 'Adjovi',
      phone: '+22997000001',
      role: 'RECRUITER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      company: {
        create: {
          name: 'Maison Adjovi',
          slug: 'maison-adjovi',
          description:
            'Maison de couture cotonoise fondee en 2014, specialisee dans le pret-a-porter feminin melant coupes contemporaines et tissus ouest-africains.',
          city: 'Cotonou',
          country: 'BJ',
          employeeCount: '11-50',
          categories: ['PRO', 'DEC', 'MAT'],
          isVerified: true,
          verifiedAt: new Date(),
        },
      },
    },
    include: { company: true },
  });

  const company =
    recruiter.company ??
    (await prisma.company.findUniqueOrThrow({ where: { userId: recruiter.id } }));

  // --- Talent --------------------------------------------------------------
  await prisma.user.upsert({
    where: { email: 'awa.kone@example.bj' },
    update: {},
    create: {
      email: 'awa.kone@example.bj',
      passwordHash: password,
      firstName: 'Awa',
      lastName: 'Kone',
      phone: '+22997000002',
      role: 'TALENT',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          slug: 'awa-kone-demo01',
          headline: 'Modeliste specialisee pret-a-porter femme',
          bio: 'Sept ans d’atelier entre Cotonou et Abidjan. Patronage a plat, moulage et industrialisation de petites series.',
          categories: ['PRO', 'DEC'],
          experienceLevel: 'CONFIRME',
          skills: ['patronage', 'moulage', 'gradation', 'fiches techniques'],
          languages: ['fr', 'en'],
          city: 'Cotonou',
          country: 'BJ',
          openToWork: true,
          openToJobTypes: ['EMPLOI', 'FREELANCE'],
          dailyRateXof: 35_000,
        },
      },
    },
  });

  // --- Offres --------------------------------------------------------------
  const now = new Date();
  let created = 0;

  for (const [index, job] of JOBS.entries()) {
    const slug = `${job.title
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)}-demo${index}`;

    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 45);

    // Deux offres restent en attente pour alimenter la file de moderation.
    const pending = index >= JOBS.length - 2;

    await prisma.job.upsert({
      where: { slug },
      update: {},
      create: {
        companyId: company.id,
        slug,
        title: job.title,
        description: job.description,
        missions: job.missions,
        requirements: job.requirements,
        benefits: ['Equipe passionnee', 'Atelier equipe', 'Formation continue'],
        category: job.category,
        secondaryCategories: job.secondary,
        jobType: job.jobType,
        workMode: 'SUR_SITE',
        experienceLevel: job.jobType === 'STAGE' ? 'DEBUTANT' : 'CONFIRME',
        city: job.city,
        country: 'BJ',
        salaryMinXof: job.salaryMin,
        salaryMaxXof: job.salaryMax,
        salaryPeriod: job.jobType === 'FREELANCE' ? 'JOUR' : 'MOIS',
        showSalary: true,
        durationMonths: job.jobType === 'STAGE' ? 6 : job.jobType === 'FREELANCE' ? 3 : null,
        status: pending ? 'PENDING_VALIDATION' : 'ACTIVE',
        submittedAt: now,
        publishedAt: pending ? null : now,
        expiresAt: pending ? null : expiresAt,
        isFeatured: !pending && job.featured,
        featuredUntil: !pending && job.featured ? expiresAt : null,
      },
    });
    created += 1;
  }

  console.log(`  ${created} offres inserees (dont 2 en attente de validation)`);
  console.log('\nComptes de demonstration — mot de passe : Fashlink2026');
  console.log('  admin@fashlink.africa           (ADMIN)');
  console.log('  recrutement@maisonadjovi.bj     (RECRUITER)');
  console.log('  awa.kone@example.bj             (TALENT)');
  console.log('\nSeed termine.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
