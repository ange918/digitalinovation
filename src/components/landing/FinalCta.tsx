import Link from 'next/link';

import { ButtonLink } from '@/components/ui/Button';
import { ArrowRightIcon } from '@/components/ui/Icons';

/** Dernier appel a l'action, sur fond bleu nuit : la page se referme dessus. */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-midnight-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-royal-500/20 blur-3xl"
      />

      <div className="container relative py-20 sm:py-26">
        <div className="max-w-2xl">
          <h2 className="font-serif text-display-sm text-white sm:text-display-md">
            Votre place est déjà dans la base.
          </h2>
          <p className="mt-5 text-body-lg text-white/70">
            Créez votre profil aujourd&apos;hui : c&apos;est gratuit pour les talents,
            et votre travail devient visible des maisons qui recrutent.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/?auth=inscription&role=talent" size="lg">
              Créer mon profil
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink
              href="/?auth=inscription&role=recruteur"
              size="lg"
              variant="secondary"
              className="bg-transparent text-white ring-white/25 hover:bg-white/10 hover:ring-white/40"
            >
              Publier une offre
            </ButtonLink>
          </div>

          <p className="mt-6 text-caption text-white/45">
            Déjà inscrit ?{' '}
            <Link
              href="/?auth=connexion"
              className="font-medium text-white/80 underline-offset-2 hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
