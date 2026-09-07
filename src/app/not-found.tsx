import Link from 'next/link';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { ButtonLink } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <>
      <SiteHeader user={null} />
      <main className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="fl-overline text-royal-500">Erreur 404</p>
        <h1 className="mt-4 font-bold text-display-md text-midnight-900">
          Cette page n&apos;existe plus
        </h1>
        <p className="mt-4 max-w-md text-body text-ink-muted">
          L&apos;offre a peut-être été clôturée, ou l&apos;adresse est incorrecte.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/offres">Voir les offres</ButtonLink>
          <Link
            href="/"
            className="inline-flex h-10 items-center px-4 text-body-sm font-medium text-ink-muted hover:text-midnight-900"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
