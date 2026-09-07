import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { AdminDashboardView } from '@/components/admin/AdminDashboardView';
import { prisma } from '@/lib/prisma';
import { requirePage } from '@/lib/rbac';

export const metadata: Metadata = {
  title: 'Interface Administrateur — FASHLINK',
  description: 'Modération des offres des maisons de production et analyse des profils candidats.',
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await requirePage(['ADMIN'], '/admin');

  const [pendingJobs, activeJobs, applications, companies] = await Promise.all([
    prisma.job.findMany({
      where: { status: 'PENDING_VALIDATION', deletedAt: null },
      orderBy: { submittedAt: 'asc' },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            isVerified: true,
          },
        },
      },
    }),
    prisma.job.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      orderBy: { publishedAt: 'desc' },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            isVerified: true,
          },
        },
      },
      take: 20,
    }),
    prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profile: {
              select: {
                headline: true,
                skills: true,
                experienceLevel: true,
              },
            },
          },
        },
      },
    }),
    prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <>
      <SiteHeader />

      <main className="container py-8 md:py-12">
        {/* En-tête de l'interface admin */}
        <header className="mb-8 border-b border-line pb-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-royal-600">
                Interface n°1 • Administrateur
              </p>
              <h1 className="mt-1 font-serif text-display-sm font-bold text-midnight-900 md:text-display-md">
                Espace de Modération & d’Analyse
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-royal-200 bg-royal-50 px-3 py-1 text-xs font-semibold text-royal-800">
                Connecté : Aïcha Soglo (Admin)
              </span>
            </div>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-ink-muted leading-relaxed">
            Consultez les offres déposées par les maisons de production avec toutes leurs conditions, publiez-les
            pour la communauté de talents, puis analysez les candidatures reçues avant de les recommander et de
            les transmettre aux maisons.
          </p>
        </header>

        <AdminDashboardView
          pendingJobs={pendingJobs}
          activeJobs={activeJobs}
          applications={applications}
          companies={companies}
        />
      </main>
    </>
  );
}
