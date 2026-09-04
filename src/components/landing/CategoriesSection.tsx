import Link from 'next/link';

import { Section } from '@/components/landing/Section';
import { CATEGORIES, CATEGORY_ORDER } from '@/lib/constants';

/**
 * Les six familles de metiers.
 *
 * Reprend `CATEGORIES` : le libelle affiche ici est exactement celui utilise
 * par les filtres, les profils et les offres. Une seule source de verite.
 */
export function CategoriesSection() {
  return (
    <Section
      id="categories"
      tone="canvas"
      eyebrow="Six métiers"
      title="Toute la chaîne de valeur"
      intro="De la matière première au client final. Choisissez une ou plusieurs familles sur votre profil : c’est ce qui vous rend trouvable."
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_ORDER.map((code) => {
          const category = CATEGORIES[code];
          return (
            <li key={code}>
              <Link
                href={`/offres?categorie=${code}`}
                className="group flex h-full flex-col rounded-card border border-line bg-white p-6 transition-all duration-250 ease-editorial hover:-translate-y-0.5 hover:border-royal-200 hover:shadow-card-hover"
              >
                <span className="fl-overline text-royal-500">{category.code}</span>
                <h3 className="mt-3 text-title-md text-midnight-900">{category.label}</h3>
                <p className="mt-2 text-body-sm text-ink-muted">{category.description}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
