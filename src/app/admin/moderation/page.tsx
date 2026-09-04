import type { Metadata } from 'next';

import { AdminApprovalTable, type PendingJobRow } from '@/components/admin/AdminApprovalTable';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { prisma } from '@/lib/prisma';
import { requirePage } from '@/lib/rbac';

export const metadata: Metadata = { title: 'Modération des offres' };
export const dynamic = 'force-dynamic';

/** Espace admin : file de validation des offres soumises. */
export default async function ModerationPage() {
  await requirePage(['ADMIN'], '/admin/moderation');

  const [pending, stats] = await Promise.all([
    fetchPendingJobs(),
    fetchStats(),
  ]);

  return (
    <>
      <SiteHeader />

      <main className="container py-10">
        <header className="mb-8">
          <p className="fl-overline">Administration</p>
          <h1 className="mt-2 font-serif text-display-sm text-midnight-900">
            Modération
          </h1>
          <p className="mt-2 max-w-2xl text-body text-ink-muted">
            Chaque offre passe ici avant publication. Valider met l&apos;offre en ligne
            immédiatement ; rejeter envoie le motif au recruteur.
          </p>
        </header>

        {/* ---- Bandeau analytique sobre ---- */}
        <dl className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="En attente" value={stats.pending} highlight />
          <StatTile label="Publiées" value={stats.active} />
          <StatTile label="Rejetées (30 j)" value={stats.rejected} />
          <StatTile label="Maisons inscrites" value={stats.companies} />
        </dl>

        <AdminApprovalTable jobs={pending} />
      </main>
    </>
  );
}

function StatTile({
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
      <dd className="mt-2 font-serif text-display-sm text-midnight-900 tabular">{value}</dd>
    </div>
  );
}

async function fetchPendingJobs(): Promise<PendingJobRow[]> {
  const jobs = await prisma.job.findMany({
    where: { status: 'PENDING_VALIDATION', deletedAt: null },
    // FIFO : la plus ancienne soumission passe en premier.
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

async function fetchStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [pending, active, rejected, companies] = await Promise.all([
    prisma.job.count({ where: { status: 'PENDING_VALIDATION', deletedAt: null } }),
    prisma.job.count({ where: { status: 'ACTIVE', deletedAt: null } }),
    prisma.job.count({
      where: { status: 'REJECTED', reviewedAt: { gte: thirtyDaysAgo } },
    }),
    prisma.company.count(),
  ]);

  return { pending, active, rejected, companies };
}
