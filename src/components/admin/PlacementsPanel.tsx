'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { setCompanyVerifiedAction } from '@/app/actions/moderation';
import { endPlacementAction } from '@/app/actions/placements';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AlertIcon, BadgeCheckIcon, BuildingIcon } from '@/components/ui/Icons';
import { cn, formatLongDate, formatXof } from '@/lib/utils';
import type { PlacementStatus } from '@prisma/client';

const PLACEMENT_STATUSES: Record<PlacementStatus, { label: string; tone: BadgeTone }> = {
  PROPOSED: { label: 'Proposé', tone: 'info' },
  ACCEPTED: { label: 'Accepté', tone: 'info' },
  ACTIVE: { label: 'En mission', tone: 'success' },
  ENDED: { label: 'Terminé', tone: 'neutral' },
  CANCELLED: { label: 'Annulé', tone: 'danger' },
};

export interface PlacementRow {
  id: string;
  status: PlacementStatus;
  startsAt: Date | string;
  endsAt: Date | string | null;
  monthlyFeeXof: number | null;
  monthlyPayXof: number | null;
  talentName: string;
  jobTitle: string;
  companyName: string;
}

export interface CompanyRow {
  id: string;
  name: string;
  city: string | null;
  isVerified: boolean;
  openDemandes: number;
}

/**
 * Placements en cours et maisons inscrites.
 *
 * Les deux vont ensemble : un placement engage FASHLINK aupres d'une maison,
 * et le badge « verifiee » est ce qui distingue une maison dont l'equipe a
 * verifie l'existence d'un compte cree en deux minutes.
 */
export function PlacementsPanel({
  placements,
  companies,
}: {
  placements: PlacementRow[];
  companies: CompanyRow[];
}) {
  const [error, setError] = useState<string | null>(null);

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

      <section className="fl-card overflow-hidden">
        <header className="border-b border-line p-5">
          <h3 className="font-bold text-title-md text-midnight-900">Placements</h3>
          <p className="mt-1 text-body-sm text-ink-muted">
            {placements.length === 0
              ? 'Aucun talent placé pour le moment.'
              : `${placements.length} placement${placements.length > 1 ? 's' : ''} enregistré${placements.length > 1 ? 's' : ''}.`}
          </p>
        </header>

        {placements.length > 0 && (
          <ul className="divide-y divide-line-subtle">
            {placements.map((placement) => (
              <PlacementItem key={placement.id} placement={placement} onError={setError} />
            ))}
          </ul>
        )}
      </section>

      <section className="fl-card overflow-hidden">
        <header className="border-b border-line p-5">
          <h3 className="font-bold text-title-md text-midnight-900">Maisons inscrites</h3>
          <p className="mt-1 text-body-sm text-ink-muted">
            Le badge « vérifiée » atteste que l&apos;équipe a confirmé l&apos;existence
            de la maison.
          </p>
        </header>

        {companies.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-canvas-alt text-ink-faint">
              <BuildingIcon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-body-sm text-ink-muted">
              Aucune maison inscrite pour le moment.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line-subtle">
            {companies.map((company) => (
              <CompanyItem key={company.id} company={company} onError={setError} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function PlacementItem({
  placement,
  onError,
}: {
  placement: PlacementRow;
  onError: (message: string | null) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const status = PLACEMENT_STATUSES[placement.status];
  const closed = placement.status === 'ENDED' || placement.status === 'CANCELLED';

  function end() {
    onError(null);
    startTransition(async () => {
      const result = await endPlacementAction({ placementId: placement.id });
      if (result.ok) {
        router.refresh();
      } else {
        onError(result.error);
      }
    });
  }

  return (
    <li className={cn('flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between', closed && 'opacity-60')}>
      <div className="min-w-0">
        <p className="font-medium text-midnight-900">{placement.talentName}</p>
        <p className="mt-0.5 text-body-sm text-ink-muted">
          {placement.companyName} · {placement.jobTitle}
        </p>
        <p className="mt-1 text-caption text-ink-subtle" suppressHydrationWarning>
          Du {formatLongDate(placement.startsAt)}
          {placement.endsAt ? ` au ${formatLongDate(placement.endsAt)}` : ' — sans terme fixe'}
        </p>

        {(placement.monthlyFeeXof || placement.monthlyPayXof) && (
          <p className="mt-1 text-caption text-ink-subtle tabular">
            {placement.monthlyFeeXof
              ? `Maison → FASHLINK : ${formatXof(placement.monthlyFeeXof)}/mois`
              : 'Montant maison non renseigné'}
            {' · '}
            {placement.monthlyPayXof
              ? `FASHLINK → talent : ${formatXof(placement.monthlyPayXof)}/mois`
              : 'Montant talent non renseigné'}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Badge tone={status.tone} dot>{status.label}</Badge>
        {!closed && (
          <Button size="sm" variant="secondary" onClick={end} loading={isPending}>
            Clôturer
          </Button>
        )}
      </div>
    </li>
  );
}

function CompanyItem({
  company,
  onError,
}: {
  company: CompanyRow;
  onError: (message: string | null) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    onError(null);
    startTransition(async () => {
      const result = await setCompanyVerifiedAction({
        companyId: company.id,
        verified: !company.isVerified,
      });

      if (result.ok) {
        router.refresh();
      } else {
        onError(result.error);
      }
    });
  }

  return (
    <li className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 font-medium text-midnight-900">
          {company.name}
          {company.isVerified && <BadgeCheckIcon className="h-4 w-4 text-royal-500" />}
        </p>
        <p className="mt-0.5 text-caption text-ink-subtle">
          {company.city ?? 'Ville non renseignée'} ·{' '}
          {company.openDemandes === 0
            ? 'aucune demande en ligne'
            : `${company.openDemandes} demande${company.openDemandes > 1 ? 's' : ''} en ligne`}
        </p>
      </div>

      <Button
        size="sm"
        variant={company.isVerified ? 'ghost' : 'secondary'}
        onClick={toggle}
        loading={isPending}
      >
        {company.isVerified ? 'Retirer le badge' : 'Marquer vérifiée'}
      </Button>
    </li>
  );
}
