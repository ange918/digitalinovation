import Link from 'next/link';

import { Wordmark } from '@/components/layout/SiteHeader';
import { CATEGORIES, CATEGORY_ORDER } from '@/lib/constants';

const COLUMNS = [
  {
    title: 'Talents',
    links: [
      { href: '/offres', label: 'Parcourir les offres' },
      { href: '/inscription?role=talent', label: 'Creer mon profil' },
      { href: '/talent/candidatures', label: 'Mes candidatures' },
    ],
  },
  {
    title: 'Maisons',
    links: [
      { href: '/inscription?role=recruteur', label: 'Publier une offre' },
      { href: '/tarifs', label: 'Nos formules' },
      { href: '/talents', label: 'Chercher un talent' },
    ],
  },
  {
    title: 'FASHLINK',
    links: [
      { href: '/a-propos', label: 'A propos' },
      { href: '/contact', label: 'Contact' },
      { href: '/mentions-legales', label: 'Mentions legales' },
      { href: '/confidentialite', label: 'Confidentialite' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="container py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-xs text-body-sm text-ink-muted">
              La plateforme qui relie les talents et les maisons de mode en Afrique
              francophone.
            </p>
            <p className="mt-6 text-caption text-ink-subtle">
              Un projet{' '}
              <span className="font-medium text-midnight-900">Susuni Lab</span>
              <br />
              Cotonou, Benin
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="fl-overline">{column.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-ink-muted transition-colors duration-150 hover:text-royal-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 border-t border-line-subtle pt-8">
          <h2 className="fl-overline">Les six metiers</h2>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {CATEGORY_ORDER.map((code) => (
              <li key={code}>
                <Link
                  href={`/offres?categorie=${code}`}
                  className="text-caption text-ink-subtle transition-colors hover:text-royal-600"
                >
                  <span className="font-semibold">{code}</span> · {CATEGORIES[code].label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-10 text-caption text-ink-faint">
          © {new Date().getFullYear()} FASHLINK — Susuni Lab. Tous droits reserves.
        </p>
      </div>
    </footer>
  );
}
