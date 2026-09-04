import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/Badge';
import { CategoryTag } from '@/components/ui/CategoryTag';
import {
  BookmarkIcon,
  BriefcaseIcon,
  ClockIcon,
  MapPinIcon,
  SparkIcon,
} from '@/components/ui/Icons';
import { EXPERIENCE_LEVELS, JOB_TYPES, WORK_MODES } from '@/lib/constants';
import { cn, formatRelativeDate, formatSalaryRange } from '@/lib/utils';
import type { Category, ExperienceLevel, JobType, WorkMode } from '@prisma/client';

export interface JobCardData {
  id: string;
  slug: string;
  title: string;
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
  publishedAt: Date | string | null;
  isFeatured: boolean;
  applicationCount: number;
  company: {
    name: string;
    slug: string;
    logoUrl: string | null;
    isVerified: boolean;
  };
}

interface JobCardProps {
  job: JobCardData;
  /** Etat visuel du bouton de sauvegarde (le toggle est gere par le parent). */
  isSaved?: boolean;
  onToggleSave?: () => void;
  className?: string;
}

/**
 * Carte d'offre — brique de la grille publique.
 *
 * Parti pris editorial :
 *  - Toute la carte est cliquable via un lien etendu (`after:absolute`), ce qui
 *    donne une grande cible tactile sans imbriquer de liens invalides en HTML.
 *  - Le bouton « sauvegarder » se place au-dessus (`z-10`) pour rester
 *    actionnable independamment.
 *  - Pas d'ombre au repos : la carte est definie par un filet fin. L'elevation
 *    n'apparait qu'au survol, comme une page qu'on souleve.
 */
export function JobCard({ job, isSaved = false, onToggleSave, className }: JobCardProps) {
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
    <article
      className={cn(
        'group relative isolate flex flex-col',
        'rounded-card border border-line bg-white p-5 sm:p-6',
        'transition-all duration-250 ease-editorial',
        'hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card-hover',
        'focus-within:border-royal-200 focus-within:shadow-card-hover',
        job.isFeatured && 'border-royal-200 bg-gradient-to-b from-royal-50/40 to-white',
        className,
      )}
    >
      {/* ---- En-tete : logo, entreprise, sauvegarde ---- */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <CompanyLogo name={job.company.name} logoUrl={job.company.logoUrl} />

          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-body-sm font-medium text-ink-muted">
              <span className="truncate">{job.company.name}</span>
              {job.company.isVerified && (
                <span
                  title="Entreprise vérifiée par FASHLINK"
                  className="shrink-0 text-royal-500"
                >
                  <VerifiedMark />
                </span>
              )}
            </p>
            {location && (
              <p className="mt-0.5 flex items-center gap-1 truncate text-caption text-ink-subtle">
                <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{location}</span>
              </p>
            )}
          </div>
        </div>

        {onToggleSave && (
          <button
            type="button"
            onClick={onToggleSave}
            aria-pressed={isSaved}
            aria-label={isSaved ? "Retirer l’offre des favoris" : "Enregistrer l’offre"}
            className={cn(
              'relative z-10 -m-1.5 shrink-0 rounded-pill p-1.5',
              'transition-colors duration-150 ease-editorial',
              'hover:bg-canvas-alt focus-visible:ring-2 focus-visible:ring-royal-500',
              isSaved ? 'text-royal-500' : 'text-ink-faint hover:text-ink-muted',
            )}
          >
            <BookmarkIcon className="h-[18px] w-[18px]" filled={isSaved} />
          </button>
        )}
      </header>

      {/* ---- Titre : la signature serif de FASHLINK ---- */}
      <h3 className="mt-4 font-bold text-title-md text-midnight-900">
        <Link
          href={`/offres/${job.slug}`}
          className={cn(
            'line-clamp-2 transition-colors duration-150 ease-editorial',
            'hover:text-royal-600 focus-visible:outline-none',
            // Lien etendu : rend toute la carte cliquable.
            'after:absolute after:inset-0 after:content-[""]',
          )}
        >
          {job.title}
        </Link>
      </h3>

      {/* ---- Meta contractuelles ---- */}
      <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-caption text-ink-muted">
        <li className="flex items-center gap-1.5">
          <BriefcaseIcon className="h-3.5 w-3.5 text-ink-faint" />
          {JOB_TYPES[job.jobType].label}
        </li>
        <li className="flex items-center gap-1.5">
          <ClockIcon className="h-3.5 w-3.5 text-ink-faint" />
          {EXPERIENCE_LEVELS[job.experienceLevel].label}
        </li>
        <li className="text-ink-subtle">{WORK_MODES[job.workMode].label}</li>
      </ul>

      {/* ---- Remuneration : seule donnee mise en avant en bleu nuit ---- */}
      {salary && (
        <p className="mt-4 text-body-sm font-semibold text-midnight-900 tabular">{salary}</p>
      )}

      {/* ---- Pied : categories + fraicheur ---- */}
      <footer className="mt-5 flex items-end justify-between gap-3 border-t border-line-subtle pt-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <CategoryTag category={job.category} />
          {job.secondaryCategories.slice(0, 1).map((category) => (
            <CategoryTag key={category} category={category} variant="code" />
          ))}
          {job.isFeatured && (
            <Badge tone="info" className="gap-1">
              <SparkIcon className="h-3 w-3" />
              À la une
            </Badge>
          )}
        </div>

        <div className="shrink-0 text-right">
          {job.publishedAt && (
            <p className="text-caption text-ink-subtle">
              {formatRelativeDate(job.publishedAt)}
            </p>
          )}
          {job.applicationCount > 0 && (
            <p className="mt-0.5 text-caption text-ink-faint tabular">
              {job.applicationCount} candidature{job.applicationCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </footer>
    </article>
  );
}

/** Logo entreprise, avec repli sur l'initiale si aucune image n'est fournie. */
function CompanyLogo({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt=""
        width={44}
        height={44}
        sizes="44px"
        className="h-11 w-11 shrink-0 rounded-lg border border-line object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
        'border border-line bg-canvas-alt font-semibold text-title-md text-midnight-400',
      )}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function VerifiedMark() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
      <path d="M8 0.8l1.5 1.5 2.1-.3.6 2 2 .6-.3 2.1L15.2 8l-1.3 1.3.3 2.1-2 .6-.6 2-2.1-.3L8 15.2l-1.5-1.5-2.1.3-.6-2-2-.6.3-2.1L.8 8l1.3-1.3-.3-2.1 2-.6.6-2 2.1.3L8 .8Z" />
      <path
        d="m5.6 8 1.7 1.7L10.6 6.4"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** Squelette affiche pendant le chargement d'une grille d'offres. */
export function JobCardSkeleton() {
  return (
    <div className="rounded-card border border-line bg-white p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="fl-skeleton h-11 w-11 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="fl-skeleton h-3 w-1/3 rounded" />
          <div className="fl-skeleton h-2.5 w-1/4 rounded" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="fl-skeleton h-4 w-4/5 rounded" />
        <div className="fl-skeleton h-4 w-3/5 rounded" />
      </div>
      <div className="mt-5 border-t border-line-subtle pt-4">
        <div className="fl-skeleton h-5 w-24 rounded-pill" />
      </div>
    </div>
  );
}
