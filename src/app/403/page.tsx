import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { ButtonLink } from '@/components/ui/Button';

export const metadata = { title: 'Accès refusé' };

export default function ForbiddenPage() {
  return (
    <>
      <SiteHeader />
      <main className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="fl-overline text-danger-500">Erreur 403</p>
        <h1 className="mt-4 font-serif text-display-md text-midnight-900">
          Accès refusé
        </h1>
        <p className="mt-4 max-w-md text-body text-ink-muted">
          Votre compte n&apos;a pas les droits nécessaires pour consulter cet espace.
        </p>
        <ButtonLink href="/" className="mt-8">
          Retour à l&apos;accueil
        </ButtonLink>
      </main>
      <SiteFooter />
    </>
  );
}
