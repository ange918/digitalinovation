import Link from 'next/link';
import type { Metadata } from 'next';
import type { Prisma } from '@prisma/client';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { JobCard, type JobCardData } from '@/components/jobs/JobCard';
import { SearchIcon } from '@/components/ui/Icons';
import { CATEGORIES, CATEGORY_ORDER, JOB_TYPES, PAGE_SIZE } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Offres d’emploi, stage et freelance dans la mode',
  description:
    'Toutes les offres publiees sur FASHLINK : emploi, stage et missions freelance dans la mode en Afrique francophone.',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    categorie?: string;
    type?: string;
    page?: string;
  }>;
}

/** Liste publique filtrable. Les filtres passent par l'URL : partageables. */
export default async function JobsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const category = CATEGORY_ORDER.find((code) => code === params.categorie);
  const jobType = (['EMPLOI', 'STAGE', 'FREELANCE'] as const).find(
    (type) => type === params.type,
  );
  const query = params.q?.trim();

  const where: Prisma.JobWhereInput = {
    status: 'ACTIVE',
    deletedAt: null,
    AND: [
      { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      ...(category
        ? [{ OR: [{ category }, { secondaryCategories: { has: category } }] }]
        : []),
      ...(query
        ? [
            {
              OR: [
                { title: { contains: query, mode: 'insensitive' as const } },
                { description: { contains: query, mode: 'insensitive' as const } },
                {
                  company: {
                    name: { contains: query, mode: 'insensitive' as const },
                  },
                },
              ],
            },
          ]
        : []),
    ],
    ...(jobType && { jobType }),
  };

  const { jobs, total, failed } = await fetchJobs(where, page);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <SiteHeader />

      <main className="min-h-[60vh]">
        <div className="border-b border-line bg-white">
          <div className="container py-12 sm:py-16">
            <h1 className="font-serif text-display-sm text-midnight-900">
              {category ? CATEGORIES[category].label : 'Toutes les offres'}
            </h1>
            <p className="mt-3 max-w-xl text-body text-ink-muted">
              {category
                ? CATEGORIES[category].description
                : 'Emploi, stage et missions freelance dans l’ecosysteme de la mode.'}
            </p>

            <form method="get" className="mt-8 flex max-w-xl gap-3">
              {category && <input type="hidden" name="categorie" value={category} />}
              <label className="relative flex-1">
                <span className="sr-only">Rechercher une offre</span>
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Metier, competence, maison..."
                  className="h-11 w-full rounded-pill border border-line bg-canvas pl-11 pr-4 text-body-sm focus:border-royal-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                />
              </label>
              <button
                type="submit"
                className="h-11 shrink-0 rounded-pill bg-royal-500 px-6 text-body-sm font-semibold text-white hover:bg-royal-600"
              >
                Filtrer
              </button>
            </form>
          </div>
        </div>

        {/* ---- Filtres ---- */}
        <div className="border-b border-line bg-canvas">
          <div className="container flex gap-2 overflow-x-auto py-4">
            <FilterChip href={buildHref({ q: query })} active={!category}>
              Toutes
            </FilterChip>
            {CATEGORY_ORDER.map((code) => (
              <FilterChip
                key={code}
                href={buildHref({ q: query, categorie: code })}
                active={category === code}
              >
                {CATEGORIES[code].short}
              </FilterChip>
            ))}
            <span className="mx-1 w-px shrink-0 bg-line" aria-hidden="true" />
            {(['EMPLOI', 'STAGE', 'FREELANCE'] as const).map((type) => (
              <FilterChip
                key={type}
                href={buildHref({
                  q: query,
                  categorie: category,
                  type: jobType === type ? undefined : type,
                })}
                active={jobType === type}
              >
                {JOB_TYPES[type].label}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="container py-12">
          {failed ? (
            <p className="rounded-card border border-dashed border-line py-20 text-center text-body-sm text-ink-subtle">
              Les offres sont momentanement indisponibles. Reessayez dans un instant.
            </p>
          ) : jobs.length === 0 ? (
            <div className="rounded-card border border-dashed border-line py-20 text-center">
              <p className="font-serif text-title-lg text-midnight-900">Aucune offre</p>
              <p className="mx-auto mt-2 max-w-sm text-body-sm text-ink-muted">
                Aucune offre ne correspond a votre recherche. Elargissez les criteres
                ou revenez bientot.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-6 text-body-sm text-ink-muted tabular">
                {total} offre{total > 1 ? 's' : ''}
              </p>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {totalPages > 1 && (
                <nav
                  aria-label="Pagination"
                  className="mt-12 flex items-center justify-center gap-2"
                >
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const target = index + 1;
                    return (
                      <Link
                        key={target}
                        href={buildHref({
                          q: query,
                          categorie: category,
                          type: jobType,
                          page: target === 1 ? undefined : String(target),
                        })}
                        aria-current={target === page ? 'page' : undefined}
                        className={cn(
                          'flex h-9 min-w-9 items-center justify-center rounded-pill px-3 text-body-sm tabular transition-colors',
                          target === page
                            ? 'bg-midnight-900 font-semibold text-white'
                            : 'border border-line text-ink-muted hover:bg-white',
                        )}
                      >
                        {target}
                      </Link>
                    );
                  })}
                </nav>
              )}
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

function buildHref(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `/offres?${qs}` : '/offres';
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'shrink-0 rounded-pill border px-4 py-1.5 text-body-sm transition-colors duration-150 ease-editorial',
        active
          ? 'border-midnight-900 bg-midnight-900 font-medium text-white'
          : 'border-line bg-white text-ink-muted hover:border-line-strong hover:text-midnight-900',
      )}
    >
      {children}
    </Link>
  );
}

async function fetchJobs(
  where: Prisma.JobWhereInput,
  page: number,
): Promise<{ jobs: JobCardData[]; total: number; failed: boolean }> {
  try {
    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
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
      }),
    ]);
    return { jobs, total, failed: false };
  } catch (error) {
    console.error('[offres] lecture impossible', error);
    return { jobs: [], total: 0, failed: true };
  }
}
