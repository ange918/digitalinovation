import type { Metadata } from 'next';

import { AdminApprovalTable, type PendingJobRow } from '@/components/admin/AdminApprovalTable';
import {
  CandidateReviewPanel,
  type DemandeGroup,
} from '@/components/admin/CandidateReviewPanel';
import {
  PlacementsPanel,
  type CompanyRow,
  type PlacementRow,
} from '@/components/admin/PlacementsPanel';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { prisma } from '@/lib/prisma';
import { requirePage } from '@/lib/rbac';

export const metadata: Metadata = {
  title: 'Board FASHLINK — Administration',
  description:
    'Demandes des maisons, analyse des candidatures et suivi des placements.',
};

export const dynamic = 'force-dynamic';

/**
 * Board administrateur.
 *
 * Un seul ecran, dans l'ordre du metier : la maison depose une demande que
 * l'administrateur seul voit, il la publie, les talents postulent, il analyse
 * puis transmet les profils, et place les retenus. Rien ne devient public sans
 * passer par la premiere section.
 */
export default async function AdminPage() {
  const admin = await requirePage(['ADMIN'], '/admin');

  const [pending, groups, placements, companies, counters] = await Promise.all([
    fetchPendingDemandes(),
    fetchCandidateGroups(),
    fetchPlacements(),
    fetchCompanies(),
    fetchCounters(),
  ]);

  return (
    <>
      <SiteHeader />

      <main className="container py-8 md:py-12">
        <header className="mb-8 border-b border-line pb-6">
          <p className="fl-overline">Administration</p>
          <h1 className="mt-2 font-bold text-display-sm text-midnight-900 md:text-display-md">
            Board FASHLINK
          </h1>
          <p className="mt-2 max-w-prose text-body text-ink-muted">
            Les demandes des maisons n&apos;existent nulle part ailleurs tant que
            vous ne les avez pas publiées. Bonjour {admin.firstName}.
          </p>
        </header>

        <dl className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Counter label="Demandes en attente" value={counters.pending} highlight />
          <Counter label="Postes à pourvoir" value={counters.openSeats} />
          <Counter label="Candidatures à analyser" value={counters.toReview} />
          <Counter label="Placements en cours" value={counters.activePlacements} />
        </dl>

        <div className="space-y-12">
          <section id="demandes" className="scroll-mt-24">
            <SectionTitle
              step={1}
              title="Demandes reçues"
              lede="Vous seul les voyez. Publier rend la demande visible des talents ; la renvoyer transmet votre motif à la maison."
            />
            <AdminApprovalTable jobs={pending} />
          </section>

          <section id="candidatures" className="scroll-mt-24">
            <SectionTitle
              step={2}
              title="Candidatures à analyser"
              lede="Regroupées par demande, avec le nombre de postes restant à pourvoir. Transmettre envoie votre analyse à la maison."
            />
            <CandidateReviewPanel groups={groups} />
          </section>

          <section id="placements" className="scroll-mt-24">
            <SectionTitle
              step={3}
              title="Placements & maisons"
              lede="Les talents actuellement placés, et les maisons dont l'équipe a vérifié l'existence."
            />
            <PlacementsPanel placements={placements} companies={companies} />
          </section>
        </div>
      </main>
    </>
  );
}

function SectionTitle({
  step,
  title,
  lede,
}: {
  step: number;
  title: string;
  lede: string;
}) {
  return (
    <header className="mb-5">
      <p className="fl-overline">Étape {step}</p>
      <h2 className="mt-1.5 font-bold text-title-lg text-midnight-900">{title}</h2>
      <p className="mt-1.5 max-w-prose text-body-sm text-ink-muted">{lede}</p>
    </header>
  );
}

function Counter({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? 'rounded-card border border-royal-200 bg-royal-50/50 p-5'
          : 'rounded-card border border-line bg-white p-5'
      }
    >
      <dt className="fl-overline">{label}</dt>
      <dd className="mt-2 font-bold text-display-sm text-midnight-900 tabular">{value}</dd>
    </div>
  );
}

// =============================================================================
// LECTURES
// =============================================================================

/** Section 1 : file FIFO des demandes en attente. */
async function fetchPendingDemandes(): Promise<PendingJobRow[]> {
  const jobs = await prisma.job.findMany({
    where: { status: 'PENDING_VALIDATION', deletedAt: null },
    // La plus ancienne soumission passe en premier : une maison qui attend
    // depuis trois jours ne doit pas etre doublee par celle d'hier.
    orderBy: { submittedAt: 'asc' },
    take: 100,
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      jobType: true,
      city: true,
      salaryMinXof: true,
      salaryMaxXof: true,
      salaryPeriod: true,
      showSalary: true,
      headcount: true,
      durationMonths: true,
      submittedAt: true,
      company: {
        select: {
          name: true,
          slug: true,
          isVerified: true,
          _count: { select: { jobs: { where: { status: 'ACTIVE' } } } },
        },
      },
    },
  });

  return jobs.map((job) => ({
    ...job,
    company: {
      name: job.company.name,
      slug: job.company.slug,
      isVerified: job.company.isVerified,
      approvedJobsCount: job.company._count.jobs,
    },
  }));
}

/**
 * Section 2 : candidatures groupees par demande.
 *
 * On part des demandes publiees plutot que des candidatures : le regroupement
 * doit porter le nombre de postes, qui appartient a la demande.
 */
async function fetchCandidateGroups(): Promise<DemandeGroup[]> {
  const jobs = await prisma.job.findMany({
    where: {
      deletedAt: null,
      status: { in: ['ACTIVE', 'CLOSED', 'EXPIRED'] },
      applications: { some: { status: { not: 'WITHDRAWN' } } },
    },
    orderBy: { publishedAt: 'desc' },
    take: 50,
    select: {
      id: true,
      title: true,
      headcount: true,
      filledCount: true,
      durationMonths: true,
      company: { select: { name: true, isVerified: true } },
      applications: {
        where: { status: { not: 'WITHDRAWN' } },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          status: true,
          createdAt: true,
          coverLetter: true,
          resumeUrlSnapshot: true,
          recruiterNote: true,
          placement: { select: { id: true } },
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              profile: {
                select: {
                  headline: true,
                  skills: true,
                  experienceLevel: true,
                  portfolioUrl: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return jobs.map((job) => ({
    jobId: job.id,
    title: job.title,
    companyName: job.company.name,
    companyIsVerified: job.company.isVerified,
    headcount: job.headcount,
    filledCount: job.filledCount,
    durationMonths: job.durationMonths,
    candidates: job.applications.map((application) => ({
      id: application.id,
      status: application.status,
      createdAt: application.createdAt,
      coverLetter: application.coverLetter,
      resumeUrlSnapshot: application.resumeUrlSnapshot,
      // `recruiterNote` porte en pratique l'analyse de l'administrateur :
      // c'est lui, et non la maison, qui qualifie les profils chez FASHLINK.
      adminNote: application.recruiterNote,
      isPlaced: application.placement !== null,
      talent: {
        firstName: application.user.firstName,
        lastName: application.user.lastName,
        email: application.user.email,
        phone: application.user.phone,
        headline: application.user.profile?.headline ?? null,
        skills: application.user.profile?.skills ?? [],
        experienceLevel: application.user.profile?.experienceLevel ?? null,
        portfolioUrl: application.user.profile?.portfolioUrl ?? null,
      },
    })),
  }));
}

/** Section 3 : placements, les cours d'abord. */
async function fetchPlacements(): Promise<PlacementRow[]> {
  const placements = await prisma.placement.findMany({
    orderBy: [{ status: 'asc' }, { startsAt: 'desc' }],
    take: 100,
    select: {
      id: true,
      status: true,
      startsAt: true,
      endsAt: true,
      monthlyFeeXof: true,
      monthlyPayXof: true,
      user: { select: { firstName: true, lastName: true } },
      job: { select: { title: true, company: { select: { name: true } } } },
    },
  });

  return placements.map((placement) => ({
    id: placement.id,
    status: placement.status,
    startsAt: placement.startsAt,
    endsAt: placement.endsAt,
    monthlyFeeXof: placement.monthlyFeeXof,
    monthlyPayXof: placement.monthlyPayXof,
    talentName: `${placement.user.firstName} ${placement.user.lastName}`,
    jobTitle: placement.job.title,
    companyName: placement.job.company.name,
  }));
}

async function fetchCompanies(): Promise<CompanyRow[]> {
  const companies = await prisma.company.findMany({
    orderBy: [{ isVerified: 'asc' }, { createdAt: 'desc' }],
    take: 100,
    select: {
      id: true,
      name: true,
      city: true,
      isVerified: true,
      _count: { select: { jobs: { where: { status: 'ACTIVE', deletedAt: null } } } },
    },
  });

  return companies.map((company) => ({
    id: company.id,
    name: company.name,
    city: company.city,
    isVerified: company.isVerified,
    openDemandes: company._count.jobs,
  }));
}

async function fetchCounters() {
  const [pending, seats, toReview, activePlacements] = await Promise.all([
    prisma.job.count({ where: { status: 'PENDING_VALIDATION', deletedAt: null } }),
    prisma.job.aggregate({
      where: { status: 'ACTIVE', deletedAt: null },
      _sum: { headcount: true, filledCount: true },
    }),
    prisma.application.count({ where: { status: { in: ['SUBMITTED', 'VIEWED'] } } }),
    prisma.placement.count({ where: { status: { in: ['PROPOSED', 'ACCEPTED', 'ACTIVE'] } } }),
  ]);

  const openSeats = Math.max(
    (seats._sum.headcount ?? 0) - (seats._sum.filledCount ?? 0),
    0,
  );

  return { pending, openSeats, toReview, activePlacements };
}
