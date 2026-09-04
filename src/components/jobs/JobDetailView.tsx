import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { CategoryTag } from '@/components/ui/CategoryTag';
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BriefcaseIcon,
  BuildingIcon,
  CheckIcon,
  ClockIcon,
  EyeIcon,
  MapPinIcon,
  UsersIcon,
} from '@/components/ui/Icons';
import { ApplyButton } from '@/components/jobs/ApplyButton';
import { EXPERIENCE_LEVELS, JOB_TYPES, WORK_MODES } from '@/lib/constants';
import { cn, formatLongDate, formatRelativeDate, formatSalaryRange } from '@/lib/utils';
import type { Category, ExperienceLevel, JobType, WorkMode } from '@prisma/client';

export interface JobDetailData {
  id: string;
  slug: string;
  title: string;
  description: string;
  missions: string[];
  requirements: string[];
  benefits: string[];
  category: Category;
  secondaryCategories: Category[];
  jobType: JobType;
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
  city: string | null;
  country: string;
  salaryMinXof: number | null;
  salaryMaxXof: number | null;
  salaryPeriod: string | null;
  showSalary: boolean;
  durationMonths: number | null;
  publishedAt: Date | string | null;
  expiresAt: Date | string | null;
  viewCount: number;
  applicationCount: number;
  company: {
    name: string;
    slug: string;
    logoUrl: string | null;
    coverUrl: string | null;
    description: string | null;
    websiteUrl: string | null;
    city: string | null;
    country: string;
    employeeCount: string | null;
    isVerified: boolean;
    categories: Category[];
    openJobsCount: number;
  };
}

interface JobDetailViewProps {
  job: JobDetailData;
  /** null = visiteur non connecte. */
  viewerRole: 'TALENT' | 'RECRUITER' | 'ADMIN' | null;
  hasApplied: boolean;
}

/**
 * Page detail d'une offre.
 *
 * Mise en page bicolore : un bandeau bleu nuit porte l'identite de l'offre,
 * le corps repose sur le fond clair. La colonne de droite reste collante sur
 * grand ecran ; sur mobile, une barre d'action fixe prend le relais en bas
 * d'ecran — le geste du pouce plutot que le scroll.
 */
export function JobDetailView({ job, viewerRole, hasApplied }: JobDetailViewProps) {
  const salary = formatSalaryRange(
    job.salaryMinXof,
    job.salaryMaxXof,
    job.salaryPeriod,
    job.showSalary,
  );
  const location = [job.city, job.country === 'BJ' ? 'Benin' : job.country]
    .filter(Boolean)
    .join(', ');

  return (
    <article className="pb-24 lg:pb-0">
      {/* ================= Bandeau bleu nuit ================= */}
      <header className="relative overflow-hidden bg-midnight-900 text-white">
        {/* Halo bleu roi tres diffus : donne de la profondeur sans motif. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-royal-500/20 blur-3xl"
        />

        <div className="container relative py-12 sm:py-16">
          <nav aria-label="Fil d’Ariane" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-caption text-white/55">
              <li>
                <Link href="/offres" className="transition-colors hover:text-white">
                  Offres
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={`/offres?categorie=${job.category}`}
                  className="transition-colors hover:text-white"
                >
                  {job.category}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="truncate text-white/80">{job.title}</li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <div className="flex items-center gap-4">
                <CompanyMark name={job.company.name} logoUrl={job.company.logoUrl} large />
                <div className="min-w-0">
                  <Link
                    href={`/entreprises/${job.company.slug}`}
                    className="inline-flex items-center gap-1.5 text-body-sm font-medium text-white/80 transition-colors hover:text-white"
                  >
                    {job.company.name}
                    {job.company.isVerified && (
                      <BadgeCheckIcon className="h-4 w-4 text-royal-300" />
                    )}
                  </Link>
                  {location && (
                    <p className="mt-1 flex items-center gap-1.5 text-caption text-white/55">
                      <MapPinIcon className="h-3.5 w-3.5" />
                      {location}
                    </p>
                  )}
                </div>
              </div>

              <h1 className="mt-6 max-w-3xl font-serif text-display-sm text-white sm:text-display-md">
                {job.title}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Badge tone="royal">{JOB_TYPES[job.jobType].label}</Badge>
                <span className="rounded-pill bg-white/10 px-2.5 py-1 text-caption text-white/80">
                  {WORK_MODES[job.workMode].label}
                </span>
                <span className="rounded-pill bg-white/10 px-2.5 py-1 text-caption text-white/80">
                  {EXPERIENCE_LEVELS[job.experienceLevel].label}
                </span>
                {job.durationMonths && (
                  <span className="rounded-pill bg-white/10 px-2.5 py-1 text-caption text-white/80">
                    {job.durationMonths} mois
                  </span>
                )}
              </div>

              {salary && (
                <p className="mt-6 font-serif text-title-lg text-white tabular">{salary}</p>
              )}

              <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-caption text-white/55">
                {job.publishedAt && (
                  <div className="flex items-center gap-1.5">
                    <ClockIcon className="h-3.5 w-3.5" />
                    <dt className="sr-only">Publiee</dt>
                    <dd>Publiée {formatRelativeDate(job.publishedAt)}</dd>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <EyeIcon className="h-3.5 w-3.5" />
                  <dt className="sr-only">Vues</dt>
                  <dd className="tabular">{job.viewCount} vues</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <UsersIcon className="h-3.5 w-3.5" />
                  <dt className="sr-only">Candidatures</dt>
                  <dd className="tabular">{job.applicationCount} candidatures</dd>
                </div>
              </dl>
            </div>

            {/* Action principale, visible sans scroll sur grand ecran. */}
            <div className="hidden lg:block">
              <div className="rounded-panel border border-white/10 bg-white/[0.07] p-6 backdrop-blur-sm">
                <p className="fl-overline text-white/50">Cette offre vous parle ?</p>
                <p className="mt-3 text-body-sm text-white/70">
                  Votre profil et votre CV FASHLINK sont transmis en un clic.
                </p>
                <div className="mt-5">
                  <ApplyButton
                    jobId={job.id}
                    jobSlug={job.slug}
                    viewerRole={viewerRole}
                    hasApplied={hasApplied}
                    expiresAt={job.expiresAt}
                    fullWidth
                  />
                </div>
                {job.expiresAt && (
                  <p className="mt-4 text-caption text-white/45">
                    Candidatures ouvertes jusqu&apos;au {formatLongDate(job.expiresAt)}.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= Corps clair ================= */}
      <div className="container py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
          {/* ---- Colonne editoriale ---- */}
          <div className="max-w-prose">
            <Section title="Le poste">
              <p className="whitespace-pre-line text-body-lg text-ink-muted">
                {job.description}
              </p>
            </Section>

            {job.missions.length > 0 && (
              <Section title="Missions">
                <BulletList items={job.missions} />
              </Section>
            )}

            {job.requirements.length > 0 && (
              <Section title="Profil recherché">
                <BulletList items={job.requirements} />
              </Section>
            )}

            {job.benefits.length > 0 && (
              <Section title="Ce que propose la maison">
                <BulletList items={job.benefits} />
              </Section>
            )}

            <Section title="Catégories">
              <div className="flex flex-wrap gap-2">
                <CategoryTag category={job.category} variant="full" />
                {job.secondaryCategories.map((category) => (
                  <CategoryTag key={category} category={category} variant="full" />
                ))}
              </div>
            </Section>
          </div>

          {/* ---- Colonne entreprise, collante ---- */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="fl-card overflow-hidden">
              {job.company.coverUrl && (
                <div className="relative h-24 w-full bg-canvas-alt">
                  <Image
                    src={job.company.coverUrl}
                    alt=""
                    fill
                    sizes="320px"
                    className="object-cover"
                  />
                </div>
              )}

              <div className={cn('p-6', job.company.coverUrl && '-mt-8')}>
                <CompanyMark
                  name={job.company.name}
                  logoUrl={job.company.logoUrl}
                  bordered={Boolean(job.company.coverUrl)}
                />

                <h2 className="mt-4 flex items-center gap-1.5 font-serif text-title-md text-midnight-900">
                  {job.company.name}
                  {job.company.isVerified && (
                    <BadgeCheckIcon className="h-4 w-4 shrink-0 text-royal-500" />
                  )}
                </h2>

                {job.company.description && (
                  <p className="mt-3 line-clamp-3 text-body-sm text-ink-muted">
                    {job.company.description}
                  </p>
                )}

                <dl className="mt-5 space-y-2.5 text-caption">
                  {job.company.city && (
                    <InfoRow icon={<MapPinIcon className="h-3.5 w-3.5" />} label="Siège">
                      {job.company.city}
                    </InfoRow>
                  )}
                  {job.company.employeeCount && (
                    <InfoRow icon={<UsersIcon className="h-3.5 w-3.5" />} label="Effectif">
                      {job.company.employeeCount} personnes
                    </InfoRow>
                  )}
                  <InfoRow
                    icon={<BriefcaseIcon className="h-3.5 w-3.5" />}
                    label="Offres en ligne"
                  >
                    {job.company.openJobsCount}
                  </InfoRow>
                  {job.company.websiteUrl && (
                    <InfoRow
                      icon={<BuildingIcon className="h-3.5 w-3.5" />}
                      label="Site web"
                    >
                      <a
                        href={job.company.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="truncate text-royal-600 underline-offset-2 hover:underline"
                      >
                        {job.company.websiteUrl.replace(/^https?:\/\//, '')}
                      </a>
                    </InfoRow>
                  )}
                </dl>

                <ButtonLink
                  href={`/entreprises/${job.company.slug}`}
                  variant="secondary"
                  size="sm"
                  className="mt-6 w-full"
                >
                  Voir la maison
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </ButtonLink>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ================= Barre d'action mobile ================= */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 lg:hidden',
          'border-t border-line bg-white/95 backdrop-blur-sm',
          // Respecte la zone de securite iOS.
          'px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4',
        )}
      >
        <div className="flex items-center gap-4">
          {salary && (
            <p className="min-w-0 flex-1 truncate text-body-sm font-semibold text-midnight-900 tabular">
              {salary}
            </p>
          )}
          <ApplyButton
            jobId={job.id}
            jobSlug={job.slug}
            viewerRole={viewerRole}
            hasApplied={hasApplied}
            expiresAt={job.expiresAt}
            fullWidth={!salary}
          />
        </div>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line-subtle py-8 first:pt-0 last:border-0">
      <h2 className="font-serif text-title-lg text-midnight-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3 text-body text-ink-muted">
          <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-royal-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-ink-muted">
      <span className="text-ink-faint">{icon}</span>
      <dt className="sr-only">{label}</dt>
      <dd className="min-w-0 truncate">{children}</dd>
    </div>
  );
}

function CompanyMark({
  name,
  logoUrl,
  large = false,
  bordered = false,
}: {
  name: string;
  logoUrl: string | null;
  large?: boolean;
  bordered?: boolean;
}) {
  const size = large ? 56 : 48;
  const classes = cn(
    'shrink-0 rounded-xl object-cover',
    large ? 'h-14 w-14' : 'h-12 w-12',
    bordered ? 'border-4 border-white bg-white' : 'border border-line',
  );

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt=""
        width={size}
        height={size}
        sizes={`${size}px`}
        className={classes}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        classes,
        'flex items-center justify-center bg-canvas-alt font-serif text-title-md text-midnight-400',
      )}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
