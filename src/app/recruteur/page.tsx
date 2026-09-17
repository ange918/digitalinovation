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

  // Strictement la maison rattachee au compte. Un `findFirst` sans filtre
  // renvoyait la premiere maison venue lorsque le compte n'en avait aucune :
  // la maison A voyait les demandes et les talents de la maison B.
  const company = user.companyId
    ? await prisma.company.findUnique({ where: { id: user.companyId } })
    : null;

  if (!company) {
    return <NoCompanyState />;
  }

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
              <h1 className="mt-1 text-display-sm font-bold text-midnight-900 md:text-display-md">
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

/**
 * Compte RECRUITER sans fiche maison : cas reel a l'inscription, la fiche
 * etant creee dans un second temps. On le dit, plutot que d'afficher le
 * tableau de bord d'une autre maison.
 */
function NoCompanyState() {
  return (
    <>
      <SiteHeader />

      <main className="container py-16">
        <div className="mx-auto max-w-xl rounded-card border border-line bg-white p-8 text-center">
          <p className="fl-overline">Espace maison</p>
          <h1 className="mt-2 font-bold text-display-sm text-midnight-900">
            Aucune maison rattachée à ce compte
          </h1>
          <p className="mt-3 text-body text-ink-muted">
            Votre fiche maison n&apos;a pas encore été créée. Écrivez-nous et
            l&apos;équipe FASHLINK la rattachera à votre compte — vous pourrez
            alors déposer vos demandes de personnel.
          </p>
        </div>
      </main>
    </>
  );
}
