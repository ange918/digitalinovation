'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { forwardCandidateToCompanyAction } from '@/app/actions/moderation';
import { createPlacementAction } from '@/app/actions/placements';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AlertIcon, BadgeCheckIcon, UsersIcon } from '@/components/ui/Icons';
import { APPLICATION_STATUSES, EXPERIENCE_LEVELS } from '@/lib/constants';
import { formatRelativeDate, initials } from '@/lib/utils';
import type { ApplicationStatus, ExperienceLevel } from '@prisma/client';

export interface CandidateRow {
  id: string;
  status: ApplicationStatus;
  createdAt: Date | string;
  coverLetter: string | null;
  resumeUrlSnapshot: string | null;
  adminNote: string | null;
  isPlaced: boolean;
  talent: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    headline: string | null;
    skills: string[];
    experienceLevel: ExperienceLevel | null;
    portfolioUrl: string | null;
  };
}

export interface DemandeGroup {
  jobId: string;
  title: string;
  companyName: string;
  companyIsVerified: boolean;
  headcount: number;
  filledCount: number;
  durationMonths: number | null;
  candidates: CandidateRow[];
}

/**
 * Analyse des candidatures, demande par demande.
 *
 * Le regroupement n'est pas cosmetique : l'administrateur ne juge pas un
 * profil dans l'absolu, il le juge au regard d'un besoin precis — « il me faut
 * six stylistes ». L'en-tete rappelle donc en permanence combien de postes
 * restent a pourvoir, seul chiffre qui dit quand s'arreter.
 */
export function CandidateReviewPanel({ groups }: { groups: DemandeGroup[] }) {
  const [error, setError] = useState<string | null>(null);

  if (groups.length === 0) {
    return (
      <section className="fl-card p-10 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-canvas-alt text-ink-faint">
          <UsersIcon className="h-5 w-5" />
        </span>
        <p className="mt-4 font-bold text-title-md text-midnight-900">
          Aucune candidature à analyser
        </p>
        <p className="mx-auto mt-1.5 max-w-sm text-body-sm text-ink-muted">
          Les candidatures apparaîtront ici dès qu&apos;un talent postulera à une
          demande publiée.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-card border border-danger-500/20 bg-danger-50 px-4 py-3 text-body-sm text-danger-700"
        >
          <AlertIcon className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {groups.map((group) => (
        <DemandeBlock key={group.jobId} group={group} onError={setError} />
      ))}
    </div>
  );
}

function DemandeBlock({
  group,
  onError,
}: {
  group: DemandeGroup;
  onError: (message: string | null) => void;
}) {
  const remaining = Math.max(group.headcount - group.filledCount, 0);

  return (
    <section className="fl-card overflow-hidden">
      <header className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-bold text-title-md text-midnight-900">{group.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-body-sm text-ink-muted">
            {group.companyName}
            {group.companyIsVerified && (
              <BadgeCheckIcon className="h-3.5 w-3.5 text-royal-500" />
            )}
            {group.durationMonths ? ` · ${group.durationMonths} mois` : ''}
          </p>
        </div>

        <Badge tone={remaining === 0 ? 'success' : 'warning'} dot className="shrink-0 self-start">
          {group.filledCount} / {group.headcount} pourvu
          {group.headcount > 1 ? 's' : ''}
          {remaining > 0 ? ` · ${remaining} à pourvoir` : ''}
        </Badge>
      </header>

      <ul className="divide-y divide-line-subtle">
        {group.candidates.map((candidate) => (
          <CandidateItem
            key={candidate.id}
            candidate={candidate}
            canPlace={remaining > 0}
            onError={onError}
          />
        ))}
      </ul>
    </section>
  );
}

function CandidateItem({
  candidate,
  canPlace,
  onError,
}: {
  candidate: CandidateRow;
  canPlace: boolean;
  onError: (message: string | null) => void;
}) {
  const [dialog, setDialog] = useState<'none' | 'forward' | 'place'>('none');
  const status = APPLICATION_STATUSES[candidate.status];
  const { talent } = candidate;

  // Le placement n'a de sens qu'une fois le profil transmis et retenu par la
  // maison : on ne place pas quelqu'un que la maison n'a jamais vu.
  const transmitted = status.step >= APPLICATION_STATUSES.SHORTLISTED.step;

  return (
    <li className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas-alt text-caption font-semibold text-ink-muted"
          >
            {initials(talent.firstName, talent.lastName)}
          </span>

          <div className="min-w-0">
            <p className="font-medium text-midnight-900">
              {talent.firstName} {talent.lastName}
            </p>
            {talent.headline && (
              <p className="mt-0.5 line-clamp-1 text-body-sm text-ink-muted">
                {talent.headline}
              </p>
            )}

            <p className="mt-1 text-caption text-ink-subtle" suppressHydrationWarning>
              {talent.experienceLevel
                ? `${EXPERIENCE_LEVELS[talent.experienceLevel].label} · `
                : ''}
              Candidature {formatRelativeDate(candidate.createdAt)}
            </p>

            {talent.skills.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {talent.skills.slice(0, 6).map((skill) => (
                  <li
                    key={skill}
                    className="rounded-pill bg-canvas-alt px-2 py-0.5 text-caption text-ink-muted"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-caption text-ink-subtle">
              <a className="hover:text-royal-600" href={`mailto:${talent.email}`}>
                {talent.email}
              </a>
              {talent.phone && <span>{talent.phone}</span>}
              {candidate.resumeUrlSnapshot && (
                <a
                  className="text-royal-600 hover:underline"
                  href={candidate.resumeUrlSnapshot}
                  target="_blank"
                  rel="noreferrer"
                >
                  CV
                </a>
              )}
              {talent.portfolioUrl && (
                <a
                  className="text-royal-600 hover:underline"
                  href={talent.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Book
                </a>
              )}
            </p>

            {candidate.adminNote && (
              <p className="mt-3 border-l-2 border-royal-200 pl-3 text-body-sm text-ink-muted">
                Analyse transmise : {candidate.adminNote}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <Badge tone={candidate.isPlaced ? 'success' : status.tone} dot>
            {candidate.isPlaced ? 'Placé·e' : status.label}
          </Badge>

          {!candidate.isPlaced && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={transmitted ? 'ghost' : 'primary'}
                onClick={() => setDialog('forward')}
              >
                {transmitted ? 'Transmettre à nouveau' : 'Transmettre à la maison'}
              </Button>

              {transmitted && (
                <Button
                  size="sm"
                  variant="success"
                  disabled={!canPlace}
                  title={canPlace ? undefined : 'Tous les postes sont pourvus.'}
                  onClick={() => setDialog('place')}
                >
                  Placer
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {dialog === 'forward' && (
        <ForwardDialog
          candidate={candidate}
          onClose={() => setDialog('none')}
          onError={onError}
        />
      )}

      {dialog === 'place' && (
        <PlaceDialog
          candidate={candidate}
          onClose={() => setDialog('none')}
          onError={onError}
        />
      )}
    </li>
  );
}

/** Analyse de l'administrateur, envoyee telle quelle a la maison. */
function ForwardDialog({
  candidate,
  onClose,
  onError,
}: {
  candidate: CandidateRow;
  onClose: () => void;
  onError: (message: string | null) => void;
}) {
  const router = useRouter();
  const [note, setNote] = useState(candidate.adminNote ?? '');
  const [isPending, startTransition] = useTransition();

  function submit() {
    onError(null);
    startTransition(async () => {
      const result = await forwardCandidateToCompanyAction({
        applicationId: candidate.id,
        adminNote: note.trim(),
      });

      if (result.ok) {
        onClose();
        router.refresh();
      } else {
        onError(result.error);
      }
    });
  }

  return (
    <Dialog
      title="Transmettre ce profil à la maison"
      subtitle={`${candidate.talent.firstName} ${candidate.talent.lastName}`}
      onClose={onClose}
    >
      <label className="block">
        <span className="fl-overline">Votre analyse, lue par la maison</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          className="fl-field-area mt-2"
          placeholder="Ce que vous avez vérifié : expérience, book, disponibilité, adéquation aux conditions de la maison."
        />
      </label>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose} disabled={isPending}>
          Annuler
        </Button>
        <Button onClick={submit} loading={isPending} disabled={note.trim().length < 3}>
          Transmettre
        </Button>
      </div>
    </Dialog>
  );
}

/** Enregistrement du placement : le talent rejoint la maison. */
function PlaceDialog({
  candidate,
  onClose,
  onError,
}: {
  candidate: CandidateRow;
  onClose: () => void;
  onError: (message: string | null) => void;
}) {
  const router = useRouter();
  const [startsAt, setStartsAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [endsAt, setEndsAt] = useState('');
  const [fee, setFee] = useState('');
  const [pay, setPay] = useState('');
  const [isPending, startTransition] = useTransition();

  function submit() {
    onError(null);
    startTransition(async () => {
      const result = await createPlacementAction({
        applicationId: candidate.id,
        startsAt,
        endsAt: endsAt || null,
        monthlyFeeXof: fee ? Number(fee) : null,
        monthlyPayXof: pay ? Number(pay) : null,
      });

      if (result.ok) {
        onClose();
        router.refresh();
      } else {
        onError(result.error);
      }
    });
  }

  return (
    <Dialog
      title="Placer ce talent"
      subtitle={`${candidate.talent.firstName} ${candidate.talent.lastName}`}
      onClose={onClose}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Début de mission">
          <input
            type="date"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
            className={FIELD_CLASS}
          />
        </Field>

        <Field label="Fin de mission (facultatif)">
          <input
            type="date"
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
            className={FIELD_CLASS}
          />
        </Field>

        <Field label="Facturé à la maison, XOF / mois">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={fee}
            onChange={(event) => setFee(event.target.value)}
            className={FIELD_CLASS}
          />
        </Field>

        <Field label="Reversé au talent, XOF / mois">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={pay}
            onChange={(event) => setPay(event.target.value)}
            className={FIELD_CLASS}
          />
        </Field>
      </div>

      <p className="mt-4 text-caption text-ink-subtle">
        La maison paie FASHLINK, FASHLINK paie le talent : les deux montants sont
        distincts et peuvent être complétés plus tard.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose} disabled={isPending}>
          Annuler
        </Button>
        <Button variant="success" onClick={submit} loading={isPending} disabled={!startsAt}>
          Enregistrer le placement
        </Button>
      </div>
    </Dialog>
  );
}

const FIELD_CLASS = 'fl-field mt-2 h-10';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="fl-overline">{label}</span>
      {children}
    </label>
  );
}

function Dialog({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end justify-center bg-midnight-950/40 p-4 backdrop-blur-sm sm:items-center"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg animate-fade-in-up rounded-panel border border-line-strong bg-white p-6">
        <h3 className="font-bold text-title-lg text-midnight-900">{title}</h3>
        <p className="mt-1.5 text-body-sm text-ink-muted">{subtitle}</p>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
