'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CategoryTag } from '@/components/ui/CategoryTag';
import {
  AlertIcon,
  BadgeCheckIcon,
  CheckIcon,
  SearchIcon,
  XIcon,
} from '@/components/ui/Icons';
import { approveJobAction, rejectJobAction } from '@/app/actions/moderation';
import { JOB_TYPES } from '@/lib/constants';
import { cn, formatRelativeDate, formatSalaryRange } from '@/lib/utils';
import type { Category, JobType } from '@prisma/client';

export interface PendingJobRow {
  id: string;
  slug: string;
  title: string;
  category: Category;
  jobType: JobType;
  city: string | null;
  salaryMinXof: number | null;
  salaryMaxXof: number | null;
  salaryPeriod: string | null;
  showSalary: boolean;
  submittedAt: Date | string | null;
  company: {
    name: string;
    slug: string;
    isVerified: boolean;
    /** Nombre d'offres deja validees : un premier depot merite plus d'attention. */
    approvedJobsCount: number;
  };
}

interface AdminApprovalTableProps {
  jobs: PendingJobRow[];
}

type RowState = { status: 'idle' } | { status: 'working' } | { status: 'done'; action: 'approved' | 'rejected' };

/**
 * File de moderation FASHLINK.
 *
 * Principes d'interface :
 *  - Une decision = un clic. Le rejet ouvre un motif car il part au recruteur.
 *  - La ligne traitee reste affichee, grisee, avec la decision prise : l'equipe
 *    voit ce qu'elle vient de faire au lieu de voir la ligne disparaitre.
 *  - Aucune couleur de fond sur les lignes : la hierarchie tient au filet et
 *    au poids typographique.
 */
export function AdminApprovalTable({ jobs }: AdminApprovalTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
  const [rejecting, setRejecting] = useState<PendingJobRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return jobs;
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(needle) ||
        job.company.name.toLowerCase().includes(needle),
    );
  }, [jobs, query]);

  const remaining = jobs.filter((job) => rowStates[job.id]?.status !== 'done').length;

  function handleApprove(job: PendingJobRow) {
    setError(null);
    setRowStates((s) => ({ ...s, [job.id]: { status: 'working' } }));

    startTransition(async () => {
      const result = await approveJobAction({ jobId: job.id });
      if (result.ok) {
        setRowStates((s) => ({ ...s, [job.id]: { status: 'done', action: 'approved' } }));
        router.refresh();
      } else {
        setRowStates((s) => ({ ...s, [job.id]: { status: 'idle' } }));
        setError(result.error);
      }
    });
  }

  function handleReject(job: PendingJobRow, reason: string) {
    setError(null);
    setRejecting(null);
    setRowStates((s) => ({ ...s, [job.id]: { status: 'working' } }));

    startTransition(async () => {
      const result = await rejectJobAction({ jobId: job.id, reason });
      if (result.ok) {
        setRowStates((s) => ({ ...s, [job.id]: { status: 'done', action: 'rejected' } }));
        router.refresh();
      } else {
        setRowStates((s) => ({ ...s, [job.id]: { status: 'idle' } }));
        setError(result.error);
      }
    });
  }

  return (
    <section className="fl-card overflow-hidden">
      {/* ---- En-tete ---- */}
      <header className="flex flex-col gap-4 border-b border-line p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-title-lg text-midnight-900">
            File de validation
          </h2>
          <p className="mt-1 text-body-sm text-ink-muted">
            {remaining === 0
              ? 'Aucune offre en attente. La file est vide.'
              : `${remaining} offre${remaining > 1 ? 's' : ''} en attente de décision.`}
          </p>
        </div>

        <label className="relative w-full sm:w-72">
          <span className="sr-only">Filtrer par titre ou entreprise</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Titre ou maison…"
            className={cn(
              'h-10 w-full rounded-pill border border-line bg-canvas pl-9 pr-4',
              'text-body-sm text-midnight-900 placeholder:text-ink-faint',
              'transition-colors duration-150 ease-editorial',
              'focus:border-royal-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-royal-500/20',
            )}
          />
        </label>
      </header>

      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 border-b border-danger-500/20 bg-danger-50 px-6 py-3 text-body-sm text-danger-700"
        >
          <AlertIcon className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {/* ---- Corps ---- */}
      {filtered.length === 0 ? (
        <EmptyState hasQuery={query.trim().length > 0} />
      ) : (
        <>
          {/* Tableau sur grand ecran */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line">
                  <Th className="pl-6">Offre</Th>
                  <Th>Maison</Th>
                  <Th>Catégorie</Th>
                  <Th>Rémunération</Th>
                  <Th>Soumise</Th>
                  <Th className="pr-6 text-right">Décision</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((job) => {
                  const state = rowStates[job.id] ?? { status: 'idle' };
                  return (
                    <tr
                      key={job.id}
                      className={cn(
                        'border-b border-line-subtle transition-colors duration-150 ease-editorial last:border-0',
                        state.status === 'done'
                          ? 'opacity-45'
                          : 'hover:bg-canvas-alt/60',
                      )}
                    >
                      <td className="max-w-xs py-4 pl-6 pr-4">
                        <Link
                          href={`/admin/offres/${job.id}`}
                          className="line-clamp-1 font-medium text-midnight-900 underline-offset-2 hover:text-royal-600 hover:underline"
                        >
                          {job.title}
                        </Link>
                        <p className="mt-0.5 text-caption text-ink-subtle">
                          {JOB_TYPES[job.jobType].label}
                          {job.city ? ` · ${job.city}` : ''}
                        </p>
                      </td>

                      <td className="py-4 pr-4">
                        <span className="flex items-center gap-1.5 text-body-sm text-ink-muted">
                          <span className="truncate">{job.company.name}</span>
                          {job.company.isVerified && (
                            <BadgeCheckIcon className="h-3.5 w-3.5 shrink-0 text-royal-500" />
                          )}
                        </span>
                        {job.company.approvedJobsCount === 0 && (
                          <Badge tone="warning" className="mt-1">
                            1re offre
                          </Badge>
                        )}
                      </td>

                      <td className="py-4 pr-4">
                        <CategoryTag category={job.category} variant="code" />
                      </td>

                      <td className="py-4 pr-4 text-body-sm text-ink-muted tabular" suppressHydrationWarning>
                        {formatSalaryRange(
                          job.salaryMinXof,
                          job.salaryMaxXof,
                          job.salaryPeriod,
                          job.showSalary,
                        ) ?? <span className="text-ink-faint">Non communiquée</span>}
                      </td>

                      <td className="py-4 pr-4 text-caption text-ink-subtle" suppressHydrationWarning>
                        {job.submittedAt ? formatRelativeDate(job.submittedAt) : '—'}
                      </td>

                      <td className="py-4 pr-6">
                        <div className="flex justify-end">
                          <RowActions
                            state={state}
                            disabled={isPending}
                            onApprove={() => handleApprove(job)}
                            onReject={() => setRejecting(job)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cartes sur mobile : un tableau a 6 colonnes est illisible au pouce. */}
          <ul className="divide-y divide-line-subtle lg:hidden">
            {filtered.map((job) => {
              const state = rowStates[job.id] ?? { status: 'idle' };
              return (
                <li
                  key={job.id}
                  className={cn('p-5', state.status === 'done' && 'opacity-45')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/offres/${job.id}`}
                        className="font-medium text-midnight-900 hover:text-royal-600"
                      >
                        {job.title}
                      </Link>
                      <p className="mt-1 flex items-center gap-1.5 text-caption text-ink-muted">
                        {job.company.name}
                        {job.company.isVerified && (
                          <BadgeCheckIcon className="h-3 w-3 text-royal-500" />
                        )}
                      </p>
                    </div>
                    <CategoryTag category={job.category} variant="code" />
                  </div>

                  <p className="mt-3 text-caption text-ink-subtle" suppressHydrationWarning>
                    {JOB_TYPES[job.jobType].label}
                    {job.city ? ` · ${job.city}` : ''}
                    {job.submittedAt ? ` · ${formatRelativeDate(job.submittedAt)}` : ''}
                  </p>

                  <div className="mt-4">
                    <RowActions
                      state={state}
                      disabled={isPending}
                      onApprove={() => handleApprove(job)}
                      onReject={() => setRejecting(job)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {rejecting && (
        <RejectDialog
          job={rejecting}
          onCancel={() => setRejecting(null)}
          onConfirm={(reason) => handleReject(rejecting, reason)}
        />
      )}
    </section>
  );
}

function RowActions({
  state,
  disabled,
  onApprove,
  onReject,
}: {
  state: RowState;
  disabled: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  if (state.status === 'done') {
    return state.action === 'approved' ? (
      <Badge tone="success">
        <CheckIcon className="h-3 w-3" />
        Publiée
      </Badge>
    ) : (
      <Badge tone="danger">
        <XIcon className="h-3 w-3" />
        Rejetée
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="danger"
        onClick={onReject}
        disabled={disabled || state.status === 'working'}
      >
        <XIcon className="h-3.5 w-3.5" />
        Rejeter
      </Button>
      <Button
        size="sm"
        variant="success"
        onClick={onApprove}
        loading={state.status === 'working'}
        disabled={disabled}
      >
        <CheckIcon className="h-3.5 w-3.5" />
        Valider
      </Button>
    </div>
  );
}

/**
 * Motif de rejet. Obligatoire : il est envoye tel quel au recruteur, qui doit
 * pouvoir corriger son annonce sans nous ecrire.
 */
function RejectDialog({
  job,
  onCancel,
  onConfirm,
}: {
  job: PendingJobRow;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const presets = [
    'Description trop succincte : précisez les missions et le profil recherché.',
    'La rémunération annoncée ne respecte pas le salaire minimum en vigueur.',
    'Offre hors du périmètre mode couvert par FASHLINK.',
    'Coordonnées de contact direct dans le texte : les échanges passent par la messagerie FASHLINK.',
  ];
  const [reason, setReason] = useState('');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-midnight-950/40 p-4 backdrop-blur-sm sm:items-center"
    >
      <div className="w-full max-w-lg animate-fade-in-up rounded-panel border border-line bg-white p-6 shadow-panel">
        <h3 id="reject-title" className="font-bold text-title-lg text-midnight-900">
          Rejeter cette offre
        </h3>
        <p className="mt-1.5 text-body-sm text-ink-muted">
          « {job.title} » — {job.company.name}
        </p>

        <div className="mt-5">
          <p className="fl-overline">Motifs fréquents</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setReason(preset)}
                className={cn(
                  'rounded-pill border px-3 py-1.5 text-left text-caption transition-colors duration-150',
                  reason === preset
                    ? 'border-royal-300 bg-royal-50 text-royal-700'
                    : 'border-line text-ink-muted hover:border-line-strong hover:bg-canvas-alt',
                )}
              >
                {preset.slice(0, 42)}…
              </button>
            ))}
          </div>
        </div>

        <label className="mt-5 block">
          <span className="fl-overline">Motif transmis au recruteur</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            required
            className={cn(
              'mt-2 w-full rounded-card border border-line bg-canvas p-3',
              'text-body-sm text-midnight-900 placeholder:text-ink-faint',
              'focus:border-royal-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-royal-500/20',
            )}
            placeholder="Expliquez précisément ce qui doit être corrigé."
          />
        </label>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
          <Button
            variant="danger"
            disabled={reason.trim().length < 10}
            onClick={() => onConfirm(reason.trim())}
          >
            Confirmer le rejet
          </Button>
        </div>
      </div>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn('py-3 pr-4 text-overline font-semibold uppercase tracking-[0.14em] text-ink-subtle', className)}
    >
      {children}
    </th>
  );
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="px-6 py-16 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-canvas-alt text-ink-faint">
        <CheckIcon className="h-5 w-5" />
      </span>
      <p className="mt-4 font-bold text-title-md text-midnight-900">
        {hasQuery ? 'Aucun résultat' : 'File vide'}
      </p>
      <p className="mx-auto mt-1.5 max-w-sm text-body-sm text-ink-muted">
        {hasQuery
          ? 'Aucune offre en attente ne correspond à cette recherche.'
          : 'Toutes les offres soumises ont été traitées. Les nouvelles arriveront ici.'}
      </p>
    </div>
  );
}
