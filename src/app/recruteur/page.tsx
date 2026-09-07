import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { RecruiterDashboardView } from '@/components/recruiter/RecruiterDashboardView';
import { prisma } from '@/lib/prisma';
import { requirePage } from '@/lib/rbac';

export const metadata: Metadata = {
  title: 'Interface Maison de Production — FASHLINK',
  description: 'Création et envoi d’offres de production, suivi de modération et réception des profils qualifiés.',
};

export const dynamic = 'force-dynamic';

export default async function RecruiterPage() {
  const user = await requirePage(['RECRUITER', 'ADMIN'], '/recruteur');

  const company =
    (await prisma.company.findFirst({
      where: user.companyId ? { id: user.companyId } : undefined,
    })) || {
      id: 'comp_1',
      name: 'Maison Adjovi',
      slug: 'maison-adjovi',
      city: 'Cotonou',
      country: 'BJ',
      isVerified: true,
      description: 'Atelier de création et de production textile, prêt-à-porter haut de gamme et séries capsule.',
    };

  const [jobs, candidates] = await Promise.all([
    prisma.job.findMany({
      where: { companyId: company.id, deletedAt: null },
      orderBy: { submittedAt: 'desc' },
      include: {
        company: true,
      },
    }),
    prisma.application.findMany({
      where: {
        job: { companyId: company.id },
        status: 'SHORTLISTED', // Profils analysés et transmis par l'administrateur
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
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
    }),
  ]);

  return (
    <>
      <SiteHeader />

      <main className="container py-8 md:py-12">
        {/* En-tête de l'interface recruteur */}
        <header className="mb-8 border-b border-line pb-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-ochre-700">
                Interface n°2 • Maisons de production & Marques
              </p>
              <h1 className="mt-1 font-serif text-display-sm font-bold text-midnight-900 md:text-display-md">
                Espace Maison de Production
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-ochre-200 bg-ochre-50 px-3 py-1 text-xs font-semibold text-ochre-900">
                Maison active : {company.name}
              </span>
            </div>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-ink-muted leading-relaxed">
            Formulez vos besoins en personnel avec toutes vos conditions d’atelier. L&apos;administrateur vérifie
            votre annonce, la diffuse aux candidats qualifiés, puis filtre et vous transmet les profils analysés.
          </p>
        </header>

        <RecruiterDashboardView
          company={company}
          jobs={jobs}
          candidates={candidates}
        />
      </main>
    </>
  );
}
