import Link from 'next/link';

import { ButtonLink } from '@/components/ui/Button';
import { ArrowRightIcon } from '@/components/ui/Icons';
import { CATEGORY_ORDER } from '@/lib/constants';

/**
 * Hero de la landing.
 *
 * Le visiteur doit comprendre en une phrase de quoi il s'agit, puis choisir
 * son camp : talent ou maison. Les deux appels a l'action ouvrent la meme
 * modale d'inscription, pre-reglee sur le bon type de compte.
 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-white">
      {/* Halo bleu roi tres diffus, seul element decoratif de la page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-royal-500/10 blur-3xl"
      />

      <div className="container relative py-20 sm:py-30">
        <div className="max-w-3xl">
          <p className="fl-overline text-royal-600">Susuni Lab · Cotonou</p>

          <h1 className="mt-6 font-bold text-display-md leading-[1.04] text-midnight-900 sm:text-display-lg">
            La mode africaine
            <br />
            recrute ses <span className="text-royal-500">talents</span>.
          </h1>

          <p className="mt-8 max-w-xl text-body-lg text-ink-muted">
            FASHLINK relie les maisons de mode d&apos;Afrique francophone à celles et
            ceux qui les font vivre. Emploi, stage et missions freelance — de la
            matière première à la communication.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/?auth=inscription&role=talent" size="lg">
              Je cherche un poste
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink
              href="/?auth=inscription&role=recruteur"
              size="lg"
              variant="secondary"
            >
              Je recrute
            </ButtonLink>
          </div>

          <p className="mt-5 text-caption text-ink-subtle">
            Gratuit pour les talents.{' '}
            <Link
              href="#tarifs"
              className="font-medium text-royal-600 underline-offset-2 hover:underline"
            >
              Voir les formules recruteur
            </Link>
          </p>
        </div>

        {/* Bandeau des six codes metiers : donne la mesure du perimetre. */}
        <ul className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line pt-8">
          {CATEGORY_ORDER.map((code) => (
            <li
              key={code}
              className="text-overline font-semibold uppercase tracking-[0.14em] text-ink-faint"
            >
              {code}
            </li>
          ))}
          <li className="text-caption text-ink-subtle">
            Six familles de métiers couvertes
          </li>
        </ul>
      </div>
    </section>
  );
}
