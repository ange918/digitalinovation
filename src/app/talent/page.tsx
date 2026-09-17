import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { TalentDashboardView } from '@/components/talent/TalentDashboardView';
import { prisma } from '@/lib/prisma';
import { requirePage } from '@/lib/rbac';

export const metadata: Metadata = {
  title: 'Interface Utilisateur & Talent — FASHLINK',
  description: 'Consultez les offres publiées par l’administrateur, postulez et suivez l’analyse de votre profil.',
};

export const dynamic = 'force-dynamic';

export default async function TalentPage() {
  const user = await requirePage(['TALENT', 'ADMIN'], '/talent');

  // Strictement le profil du compte connecte. Un profil de demonstration
  // etait fabrique ici quand il n'en existait pas : le talent voyait des
  // competences et un book qui n'etaient pas les siens.
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

  if (!profile) {
    return <NoProfileState />;
  }

  const [publishedJobs, myApplications] = await Promise.all([
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
            city: true,
          },
        },
      },
    }),
    prisma.application.findMany({
      where: { userId: user.id },
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
      },
    }),
  ]);

  return (
    <>
      <SiteHeader />

      <main className="container py-8 md:py-12">
        {/* En-tête de l'interface utilisateur */}
        <header className="mb-8 border-b border-line pb-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                Interface n°3 • Utilisateurs & Candidats
              </p>
              <h1 className="mt-1 text-display-sm font-bold text-midnight-900 md:text-display-md">
                Espace Talent de la Mode
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
                Connecté : {user.firstName} {user.lastName} (Talent)
              </span>
            </div>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-ink-muted leading-relaxed">
            Consultez les offres modérées et publiées par l&apos;administrateur FASHLINK. Postulez en un clic pour que
            l&apos;administrateur examine vos compétences, valide votre profil et le transmette directement à la maison de production.
          </p>
        </header>

        <TalentDashboardView
          user={user}
          profile={profile}
          publishedJobs={publishedJobs}
          myApplications={myApplications}
        />
      </main>
    </>
  );
}

/**
 * Compte TALENT sans profil : cas reel juste apres l'inscription, le profil
 * etant complete dans un second temps.
 */
function NoProfileState() {
  return (
    <>
      <SiteHeader />

      <main className="container py-16">
        <div className="mx-auto max-w-xl rounded-card border border-line bg-white p-8 text-center">
          <p className="fl-overline">Espace talent</p>
          <h1 className="mt-2 font-bold text-display-sm text-midnight-900">
            Votre profil n&apos;est pas encore créé
          </h1>
          <p className="mt-3 text-body text-ink-muted">
            Complétez votre profil — métier, compétences, book — pour que
            FASHLINK puisse vous proposer aux maisons.
          </p>
        </div>
      </main>
    </>
  );
}
