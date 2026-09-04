import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';

import './globals.css';

/**
 * Genova porte toute l'identite FASHLINK, titres compris : c'est la police du
 * site Susuni Lab, chargee depuis le meme CDN (voir le <link> dans <head>).
 *
 * Poppins reste en repli, auto-hebergee par next/font mais **sans preload** :
 * le fichier n'est telecharge que si Genova ne se charge pas. cdnfonts.com est
 * un tiers hors de notre controle ; sans ce repli, une panne du CDN renverrait
 * toute la plateforme a la police systeme.
 */
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  preload: false,
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
    <html lang="fr" className={poppins.variable}>
      <head>
        {/* Genova — police de marque Susuni Lab. Meme source que susunilab.com. */}
        <link href="https://fonts.cdnfonts.com/css/genova" rel="stylesheet" />
      </head>
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
