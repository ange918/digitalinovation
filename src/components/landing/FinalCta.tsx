import Link from 'next/link';

import { ButtonLink } from '@/components/ui/Button';
import { ArrowRightIcon } from '@/components/ui/Icons';

const COPY = {
  talent: {
    title: 'Votre place est déjà dans la base.',
    body: "Créez votre profil aujourd’hui : c’est gratuit, et votre travail devient visible des maisons qui recrutent.",
    cta: 'Créer mon profil',
    role: 'talent',
    secondary: { label: 'Je suis une maison de mode', href: '/maisons' },
  },
  maison: {
    title: 'Dites-nous de qui vous avez besoin.',
    body: "Exprimez votre besoin, FASHLINK constitue l’équipe et la met à votre disposition. Vous n’avez qu’un seul interlocuteur.",
    cta: 'Créer le compte de ma maison',
    role: 'recruteur',
    secondary: { label: 'Je cherche du travail', href: '/talents' },
  },
} as const;

/**
 * Dernier appel a l'action, sur fond bleu nuit : la page se referme dessus.
 *
 * Le lien secondaire renvoie vers l'autre parcours d'entree — un visiteur
 * arrive sur la mauvaise page doit pouvoir rejoindre la sienne sans repartir
 * de zero.
 */
export function FinalCta({
  audience = 'talent',
}: {
  audience?: 'talent' | 'maison';
}) {
  const copy = COPY[audience];

  return (
    <section className="relative overflow-hidden bg-midnight-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-royal-500/20 blur-3xl"
      />

      <div className="container relative py-20 sm:py-26">
        <div className="max-w-2xl">
          <h2 className="font-bold text-display-sm text-white sm:text-display-md">
            {copy.title}
          </h2>
          <p className="mt-5 text-body-lg text-white/70">{copy.body}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={`?auth=inscription&role=${copy.role}`} size="lg">
              {copy.cta}
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink
              href={copy.secondary.href}
              size="lg"
              variant="secondary"
              className="bg-transparent text-white ring-white/25 hover:bg-white/10 hover:ring-white/40"
            >
              {copy.secondary.label}
            </ButtonLink>
          </div>

          <p className="mt-6 text-caption text-white/45">
            Déjà inscrit ?{' '}
            <Link
              href="?auth=connexion"
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
