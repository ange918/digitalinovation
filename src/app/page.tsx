import Link from 'next/link';
import type { Metadata } from 'next';

import { ArrowRightIcon, BuildingIcon, UsersIcon } from '@/components/ui/Icons';
import { Wordmark } from '@/components/layout/SiteHeader';
import { CATEGORY_ORDER } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'FASHLINK — La mode africaine recrute',
  description:
    "Plateforme de mise en relation entre les maisons de mode d’Afrique francophone et les professionnels qui cherchent du travail. Un projet Susuni Lab, Cotonou.",
};

/**
 * Aiguillage.
 *
 * Les deux publics n'ont ni le même message ni la même intention : cette page
 * ne fait que les orienter vers leur parcours. Volontairement nue — pas de
 * navigation, pas de sections. Tout le contenu vit sur /talents et /maisons.
 */
export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-midnight-900 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 -top-48 h-[40rem] w-[40rem] rounded-full bg-royal-500/20 blur-3xl"
      />

      <header className="container relative pt-10">
        <Wordmark className="text-white" />
      </header>

      <div className="container relative flex flex-1 flex-col justify-center py-16">
        <p className="fl-overline text-royal-300">Susuni Lab · Cotonou</p>

        <h1 className="mt-6 max-w-3xl text-display-md font-bold leading-[1.05] sm:text-display-lg">
          La mode africaine recrute.
        </h1>

        <p className="mt-6 max-w-xl text-body-lg text-white/70">
          Dites-nous qui vous êtes, nous vous montrons le bon chemin.
        </p>

        <div className="mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
          <ChoiceCard
            href="/talents"
            icon={<UsersIcon className="h-6 w-6" />}
            eyebrow="Je cherche du travail"
            title="Je suis un talent"
            body="Couture, modélisme, broderie, mannequinat, vente — votre métier a sa place ici."
          />
          <ChoiceCard
            href="/maisons"
            icon={<BuildingIcon className="h-6 w-6" />}
            eyebrow="Je cherche de la main-d’œuvre"
            title="Je suis une maison de mode"
            body="Exprimez votre besoin, nous constituons l’équipe et la mettons à votre disposition."
          />
        </div>

        <ul className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-8">
          {CATEGORY_ORDER.map((code) => (
            <li
              key={code}
              className="text-overline font-semibold uppercase tracking-[0.14em] text-white/30"
            >
              {code}
            </li>
          ))}
          <li className="text-caption text-white/40">
            Six familles de métiers couvertes
          </li>
        </ul>
      </div>
    </main>
  );
}

function ChoiceCard({
  href,
  icon,
  eyebrow,
  title,
  body,
}: {
  href: string;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-panel border border-white/15 bg-white/[0.06] p-7 transition-all duration-250 ease-editorial hover:-translate-y-0.5 hover:border-royal-400/60 hover:bg-white/[0.1]"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-royal-500/20 text-royal-200">
        {icon}
      </span>

      <p className="fl-overline mt-6 text-white/40">{eyebrow}</p>
      <h2 className="mt-2 text-title-lg font-bold text-white">{title}</h2>
      <p className="mt-3 flex-1 text-body-sm text-white/60">{body}</p>

      <span className="mt-6 inline-flex items-center gap-2 text-body-sm font-semibold text-royal-300 transition-all group-hover:gap-3">
        Continuer
        <ArrowRightIcon className="h-4 w-4" />
      </span>
    </Link>
  );
}
