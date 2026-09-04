import { Section } from '@/components/landing/Section';
import { ButtonLink } from '@/components/ui/Button';
import { ArrowRightIcon, BuildingIcon, CheckIcon, UsersIcon } from '@/components/ui/Icons';
import { RECRUITER_BENEFITS, TALENT_BENEFITS, type Benefit } from '@/lib/landing-content';

/**
 * Section « ce que vous gagnez ».
 *
 * C'est la premiere chose que le visiteur lit apres le hero : ce qu'il obtient
 * en entrant dans la base. Deux colonnes, une par public, pour qu'il se
 * reconnaisse immediatement sans avoir a lire l'autre.
 */
export function BenefitsSection() {
  return (
    <Section
      id="avantages"
      tone="warm"
      eyebrow="Pourquoi s’inscrire"
      title="Ce que vous gagnez à entrer dans la base"
      intro="FASHLINK n’est pas un mur d’annonces. C’est un annuaire vivant de l’écosystème mode, où les profils et les maisons se trouvent."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <BenefitColumn
          icon={<UsersIcon className="h-5 w-5" />}
          audience="Talents"
          title="Vous cherchez un poste"
          note="Gratuit, sans limite de durée"
          benefits={TALENT_BENEFITS}
          ctaLabel="Créer mon profil talent"
          ctaHref="/?auth=inscription&role=talent"
          highlighted
        />
        <BenefitColumn
          icon={<BuildingIcon className="h-5 w-5" />}
          audience="Maisons"
          title="Vous recrutez"
          note="À partir de la formule gratuite"
          benefits={RECRUITER_BENEFITS}
          ctaLabel="Inscrire ma maison"
          ctaHref="/?auth=inscription&role=recruteur"
        />
      </div>
    </Section>
  );
}

function BenefitColumn({
  icon,
  audience,
  title,
  note,
  benefits,
  ctaLabel,
  ctaHref,
  highlighted = false,
}: {
  icon: React.ReactNode;
  audience: string;
  title: string;
  note: string;
  benefits: Benefit[];
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={
        highlighted
          ? 'flex flex-col rounded-panel border border-royal-200 bg-white p-7 sm:p-8'
          : 'flex flex-col rounded-panel border border-line bg-white p-7 sm:p-8'
      }
    >
      <div className="flex items-center gap-3">
        <span
          className={
            highlighted
              ? 'flex h-10 w-10 items-center justify-center rounded-full bg-royal-50 text-royal-600'
              : 'flex h-10 w-10 items-center justify-center rounded-full bg-canvas-alt text-ink-muted'
          }
        >
          {icon}
        </span>
        <div>
          <p className="fl-overline">{audience}</p>
          <h3 className="mt-0.5 text-title-md text-midnight-900">{title}</h3>
        </div>
      </div>

      <ul className="mt-7 flex-1 space-y-5">
        {benefits.map((benefit) => (
          <li key={benefit.title} className="flex gap-3">
            <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-royal-500" />
            <div>
              <p className="text-body-sm font-semibold text-midnight-900">
                {benefit.title}
              </p>
              <p className="mt-1 text-body-sm text-ink-muted">{benefit.body}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 border-t border-line-subtle pt-6">
        <ButtonLink
          href={ctaHref}
          variant={highlighted ? 'primary' : 'secondary'}
          className="w-full"
        >
          {ctaLabel}
          <ArrowRightIcon className="h-4 w-4" />
        </ButtonLink>
        <p className="mt-3 text-center text-caption text-ink-subtle">{note}</p>
      </div>
    </div>
  );
}
