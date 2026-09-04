'use client';

import Link from 'next/link';
import { useState } from 'react';

import { ButtonLink } from '@/components/ui/Button';
import { CheckIcon, XIcon } from '@/components/ui/Icons';
import { PLAN_CATALOG } from '@/lib/constants';
import { PLAN_COMPARISON } from '@/lib/landing-content';
import { cn, formatXof } from '@/lib/utils';
import type { PlanTier } from '@prisma/client';

const TIERS: PlanTier[] = ['STARTER', 'PRO', 'PREMIUM'];

/**
 * Tarifs.
 *
 * Trois cartes pour decider vite, puis un tableau comparatif complet pour
 * ceux qui veulent le detail ligne par ligne. La bascule mensuel/annuel
 * calcule l'economie reelle depuis le catalogue plutot que de l'annoncer en
 * dur : si un prix change, le pourcentage suit.
 */
export function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section
      id="tarifs"
      className="border-b border-line bg-canvas-warm py-20 sm:py-26"
      style={{ scrollMarginTop: 'var(--fl-header-height)' }}
    >
      <div className="container">
        <header className="max-w-2xl">
          <p className="fl-overline text-royal-600">Tarifs recruteur</p>
          <h2 className="mt-4 font-bold text-display-sm text-midnight-900 sm:text-display-md">
            Payez ce que vous utilisez
          </h2>
          <p className="mt-5 text-body-lg text-ink-muted">
            Les talents ne paient jamais. Les maisons choisissent une formule selon
            leur rythme de recrutement, réglée par mobile money.
          </p>
        </header>

        {/* ---- Bascule mensuel / annuel ---- */}
        <div className="mt-10 inline-flex items-center gap-1 rounded-pill border border-line bg-white p-1">
          <CycleButton active={!yearly} onClick={() => setYearly(false)}>
            Mensuel
          </CycleButton>
          <CycleButton active={yearly} onClick={() => setYearly(true)}>
            Annuel
            <span className="ml-1.5 text-caption font-normal opacity-80">2 mois offerts</span>
          </CycleButton>
        </div>

        {/* ---- Cartes ---- */}
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <PlanCard key={tier} tier={tier} yearly={yearly} />
          ))}
        </div>

        {/* ---- Tableau comparatif ---- */}
        <div className="mt-16">
          <h3 className="text-title-md text-midnight-900">Le détail, formule par formule</h3>

          <div className="mt-6 overflow-x-auto rounded-card border border-line bg-white">
            <table className="w-full min-w-[36rem] text-left">
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="fl-overline px-5 py-4">
                    Capacité
                  </th>
                  {TIERS.map((tier) => (
                    <th
                      key={tier}
                      scope="col"
                      className={cn(
                        'px-5 py-4 text-caption font-semibold uppercase tracking-[0.14em]',
                        tier === 'PRO' ? 'text-royal-600' : 'text-ink-subtle',
                      )}
                    >
                      {PLAN_CATALOG[tier].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAN_COMPARISON.map((row) => (
                  <tr key={row.label} className="border-b border-line-subtle last:border-0">
                    <th
                      scope="row"
                      className="px-5 py-3.5 text-body-sm font-normal text-ink-muted"
                    >
                      {row.label}
                    </th>
                    <Cell value={row.starter} />
                    <Cell value={row.pro} highlighted />
                    <Cell value={row.premium} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-caption text-ink-subtle">
            Tarifs indicatifs, susceptibles d&apos;évoluer avant l&apos;ouverture
            publique. Règlement par CinetPay (MTN, Moov, Celtiis, carte bancaire),
            Wave ou MTN MoMo. Aucun prélèvement automatique : votre formule court
            jusqu&apos;à son terme, puis le compte revient au palier Starter.
          </p>
        </div>
      </div>
    </section>
  );
}

function PlanCard({ tier, yearly }: { tier: PlanTier; yearly: boolean }) {
  const plan = PLAN_CATALOG[tier];
  const isFree = plan.priceXof === 0;
  const featured = tier === 'PRO';

  const price = yearly ? (plan.priceYearlyXof ?? plan.priceXof * 12) : plan.priceXof;
  const savings =
    yearly && plan.priceYearlyXof ? plan.priceXof * 12 - plan.priceYearlyXof : 0;

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-panel border bg-white p-7',
        featured ? 'border-royal-300 shadow-card' : 'border-line',
      )}
    >
      {featured && (
        <span className="absolute -top-3 left-7 rounded-pill bg-royal-500 px-3 py-1 text-overline font-semibold uppercase tracking-[0.14em] text-white">
          Le plus choisi
        </span>
      )}

      <h3 className="text-title-md text-midnight-900">{plan.name}</h3>
      <p className="mt-1.5 min-h-[2.75rem] text-body-sm text-ink-muted">{plan.pitch}</p>

      <div className="mt-6">
        {isFree ? (
          <p className="font-bold text-display-sm text-midnight-900">Gratuit</p>
        ) : (
          <>
            <p className="font-bold text-display-sm text-midnight-900 tabular">
              {formatXof(price)}
            </p>
            <p className="mt-1 text-caption text-ink-subtle">
              par {yearly ? 'an' : 'mois'}
              {savings > 0 && (
                <span className="ml-2 rounded-pill bg-success-50 px-2 py-0.5 font-medium text-success-700">
                  {formatXof(savings)} économisés
                </span>
              )}
            </p>
          </>
        )}
      </div>

      <ul className="mt-7 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2.5 text-body-sm text-ink-muted">
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-royal-500" />
            {feature}
          </li>
        ))}
      </ul>

      <ButtonLink
        href="/?auth=inscription&role=recruteur"
        variant={featured ? 'primary' : 'secondary'}
        className="mt-8 w-full"
      >
        {isFree ? 'Commencer gratuitement' : `Choisir ${plan.name}`}
      </ButtonLink>
    </div>
  );
}

function Cell({ value, highlighted = false }: { value: string; highlighted?: boolean }) {
  const isNo = value === '—';
  const isYes = value === 'Oui';

  return (
    <td
      className={cn(
        'px-5 py-3.5 text-body-sm tabular',
        highlighted ? 'bg-royal-50/40' : '',
        isNo ? 'text-ink-faint' : 'text-midnight-900',
      )}
    >
      {isYes ? (
        <CheckIcon className="h-4 w-4 text-success-500" aria-label="Inclus" />
      ) : isNo ? (
        <XIcon className="h-4 w-4 text-ink-faint" aria-label="Non inclus" />
      ) : (
        value
      )}
    </td>
  );
}

function CycleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-pill px-4 py-2 text-body-sm font-medium transition-colors duration-150 ease-editorial',
        active
          ? 'bg-midnight-900 text-white'
          : 'text-ink-muted hover:text-midnight-900',
      )}
    >
      {children}
    </button>
  );
}

/** Rappel discret pour les talents, place sous les tarifs. */
export function TalentFreeNote() {
  return (
    <p className="text-body-sm text-ink-muted">
      Vous cherchez un poste ?{' '}
      <Link
        href="/?auth=inscription&role=talent"
        className="font-semibold text-royal-600 underline-offset-2 hover:underline"
      >
        L&apos;inscription est gratuite
      </Link>
      .
    </p>
  );
}
