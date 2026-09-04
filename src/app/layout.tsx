import type { Metadata, Viewport } from 'next';
import { DM_Serif_Display, Poppins } from 'next/font/google';

import './globals.css';

/**
 * Polices auto-hebergees par next/font : aucun appel a fonts.googleapis.com au
 * runtime, donc pas de round-trip DNS supplementaire sur un reseau lent, et
 * zero decalage de mise en page grace au `size-adjust` genere.
 *
 * DM Serif Display reste reserve aux tres grands titres (h1, h2) : c'est la
 * signature editoriale FASHLINK. Tout le reste passe en Poppins.
 */
const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-dm-serif',
});

/**
 * Poppins : sans-serif geometrique alignee sur l'identite Susuni Lab.
 * Porte toute l'interface — boutons, cartes, tarifs, corps de texte.
 */
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-poppins',
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'FASHLINK — Emploi, stage et freelance dans la mode',
    template: '%s · FASHLINK',
  },
  description:
    "La plateforme qui relie les talents et les maisons de mode en Afrique francophone. Emploi, stage et missions freelance, de la matière à la communication.",
  applicationName: 'FASHLINK',
  authors: [{ name: 'Susuni Lab', url: 'https://susunilab.com' }],
  keywords: [
    'mode',
    'emploi',
    'stage',
    'freelance',
    'Benin',
    'Cotonou',
    'Afrique francophone',
    'styliste',
    'modeliste',
    'mannequin',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'FASHLINK',
    title: 'FASHLINK — Emploi, stage et freelance dans la mode',
    description:
      'Talents et maisons de mode se rencontrent ici. Un projet Susuni Lab, Cotonou.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#1A2044',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${dmSerif.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-canvas antialiased">
        {/* Lien d'evitement : premiere tabulation pour les lecteurs d'ecran. */}
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-midnight-900 focus:px-4 focus:py-2 focus:text-body-sm focus:text-white"
        >
          Aller au contenu principal
        </a>
        <div id="contenu">{children}</div>
      </body>
    </html>
  );
}
