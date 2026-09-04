import Link from 'next/link';

import { ButtonLink } from '@/components/ui/Button';
import { getCurrentUser } from '@/lib/auth';
import { landingPathForRole } from '@/lib/routes';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/offres', label: 'Offres' },
  { href: '/talents', label: 'Talents' },
  { href: '/entreprises', label: 'Maisons' },
  { href: '/tarifs', label: 'Tarifs' },
];

/** En-tete global. Server Component : la session est lue sans JS cote client. */
export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="container flex h-[var(--fl-header-height)] items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <Link href="/" className="shrink-0" aria-label="FASHLINK, accueil">
            <Wordmark />
          </Link>

          <nav aria-label="Navigation principale" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'text-body-sm font-medium text-ink-muted',
                      'transition-colors duration-150 ease-editorial hover:text-midnight-900',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <ButtonLink href={landingPathForRole(user.role)} variant="secondary" size="sm">
              Mon espace
            </ButtonLink>
          ) : (
            <>
              <Link
                href="/connexion"
                className="hidden text-body-sm font-medium text-ink-muted transition-colors hover:text-midnight-900 sm:block"
              >
                Se connecter
              </Link>
              <ButtonLink href="/inscription" size="sm">
                Rejoindre
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * Logotype typographique : lettrage serif tres espace, le « LINK » en bleu roi.
 * Pas de fichier image — le texte reste net a toutes les densites d'ecran.
 */
function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'font-serif text-title-md tracking-[0.18em] text-midnight-900',
        className,
      )}
    >
      FASH<span className="text-royal-500">LINK</span>
    </span>
  );
}

export { Wordmark };
