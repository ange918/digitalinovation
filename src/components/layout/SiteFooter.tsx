import Link from 'next/link';

import { Wordmark } from '@/components/layout/SiteHeader';
import { CATEGORIES, CATEGORY_ORDER } from '@/lib/constants';

/**
 * Liens du pied de page.
 * Uniquement des ancres de la landing et des pages qui existent : aucun 404.
 */
const COLUMNS = [
  {
    title: 'Talents',
    links: [
      { href: '/offres', label: 'Parcourir les offres' },
      { href: '/?auth=inscription&role=talent', label: 'Créer mon profil' },
      { href: '/#avantages', label: 'Pourquoi s\u2019inscrire' },
    ],
  },
  {
    title: 'Maisons',
    links: [
      { href: '/?auth=inscription&role=recruteur', label: 'Publier une offre' },
      { href: '/#tarifs', label: 'Nos formules' },
      { href: '/#fonctionnement', label: 'Comment ça marche' },
    ],
  },
  {
    title: 'FASHLINK',
    links: [
      { href: '/#faq', label: 'Questions fréquentes' },
      { href: '/#categories', label: 'Les six métiers' },
      { href: '/?auth=connexion', label: 'Se connecter' },
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
              Cotonou, Bénin
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
          <h2 className="fl-overline">Les six métiers</h2>
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
          © {new Date().getFullYear()} FASHLINK — Susuni Lab. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
