import Link from 'next/link';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { ButtonLink } from '@/components/ui/Button';
import { ArrowRightIcon, SearchIcon } from '@/components/ui/Icons';
import { JobCard, JobCardSkeleton, type JobCardData } from '@/components/jobs/JobCard';
import { CATEGORIES, CATEGORY_ORDER } from '@/lib/constants';
import { prisma } from '@/lib/prisma';

export const revalidate = 120;

/** Accueil editorial : une promesse, une recherche, les dernieres offres. */
export default async function HomePage() {
  const jobs = await fetchLatestJobs();

  return (
    <>
      <SiteHeader />

      <main>
        {/* ---------- Hero ---------- */}
        <section className="border-b border-line bg-white">
          <div className="container py-20 sm:py-28">
            <div className="max-w-3xl">
              <p className="fl-overline text-royal-600">Susuni Lab · Cotonou</p>

              <h1 className="mt-6 font-serif text-display-md leading-[1.05] text-midnight-900 sm:text-display-lg">
                La mode africaine
                <br />
                recrute ses talents.
              </h1>

              <p className="mt-8 max-w-xl text-body-lg text-ink-muted">
                Emploi, stage et missions freelance — de la matiere premiere a la
                communication. FASHLINK relie les maisons de mode d&apos;Afrique
                francophone a celles et ceux qui les font vivre.
              </p>

              <form
                action="/offres"
                method="get"
                className="mt-10 flex max-w-xl flex-col gap-3 sm:flex-row"
              >
                <label className="relative flex-1">
                  <span className="sr-only">Metier, competence ou maison</span>
                  <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                  <input
                    type="search"
                    name="q"
                    placeholder="Modeliste, mannequin, community manager..."
                    className="h-12 w-full rounded-pill border border-line bg-canvas pl-11 pr-4 text-body-sm text-midnight-900 placeholder:text-ink-faint focus:border-royal-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                  />
                </label>
                <button
                  type="submit"
                  className="h-12 shrink-0 rounded-pill bg-royal-500 px-7 text-body-sm font-semibold text-white shadow-royal transition-colors duration-150 hover:bg-royal-600"
                >
                  Rechercher
                </button>
              </form>

              <p className="mt-4 text-caption text-ink-subtle">
                Vous recrutez ?{' '}
                <Link
                  href="/inscription?role=recruteur"
                  className="font-medium text-royal-600 underline-offset-2 hover:underline"
                >
                  Publiez votre offre
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* ---------- Les six categories ---------- */}
        <section className="border-b border-line bg-canvas-warm">
          <div className="container py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="fl-overline">Six metiers</p>
                <h2 className="mt-3 font-serif text-display-sm text-midnight-900">
                  Toute la chaine de valeur
                </h2>
              </div>
              <Link
                href="/offres"
                className="inline-flex items-center gap-1.5 text-body-sm font-medium text-royal-600 hover:underline"
              >
                Voir toutes les offres
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORY_ORDER.map((code) => {
                const category = CATEGORIES[code];
                return (
                  <li key={code}>
                    <Link
                      href={`/offres?categorie=${code}`}
                      className="group flex h-full flex-col rounded-card border border-line bg-white p-6 transition-all duration-250 ease-editorial hover:-translate-y-0.5 hover:border-royal-200 hover:shadow-card-hover"
                    >
                      <span className="fl-overline text-royal-500">{category.code}</span>
                      <h3 className="mt-3 font-serif text-title-md text-midnight-900">
                        {category.label}
                      </h3>
                      <p className="mt-2 text-body-sm text-ink-muted">
                        {category.description}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ---------- Dernieres offres ---------- */}
        <section className="bg-canvas">
          <div className="container py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="fl-overline">Fraichement publiees</p>
                <h2 className="mt-3 font-serif text-display-sm text-midnight-900">
                  Dernieres offres
                </h2>
              </div>
              <ButtonLink href="/offres" variant="secondary" size="sm">
                Toutes les offres
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {jobs === null ? (
                // Base non joignable : on affiche des squelettes plutot qu'une
                // page en erreur — la vitrine reste consultable.
                Array.from({ length: 6 }).map((_, index) => <JobCardSkeleton key={index} />)
              ) : jobs.length === 0 ? (
                <p className="col-span-full rounded-card border border-dashed border-line py-16 text-center text-body-sm text-ink-subtle">
                  Aucune offre publiee pour le moment. Revenez tres vite.
                </p>
              ) : (
                jobs.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

/**
 * Retourne null si la base n'est pas joignable : l'accueil est la vitrine
 * publique, elle ne doit jamais tomber a cause d'une panne de lecture.
 */
async function fetchLatestJobs(): Promise<JobCardData[] | null> {
  try {
    return await prisma.job.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
      take: 6,
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        secondaryCategories: true,
        jobType: true,
        workMode: true,
        experienceLevel: true,
        city: true,
        country: true,
        salaryMinXof: true,
        salaryMaxXof: true,
        salaryPeriod: true,
        showSalary: true,
        publishedAt: true,
        isFeatured: true,
        applicationCount: true,
        company: { select: { name: true, slug: true, logoUrl: true, isVerified: true } },
      },
    });
  } catch (error) {
    console.error('[accueil] lecture des offres impossible', error);
    return null;
  }
}
