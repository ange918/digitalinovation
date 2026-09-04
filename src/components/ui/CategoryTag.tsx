import type { Category } from '@prisma/client';

import { CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface CategoryTagProps {
  category: Category;
  /**
   * `code`  : le sigle seul (MAT, PRO...) — listes denses.
   * `short` : un mot — cartes d'offre.
   * `full`  : libelle complet — page detail et filtres.
   */
  variant?: 'code' | 'short' | 'full';
  className?: string;
}

/**
 * Tag de categorie metier.
 *
 * Volontairement monochrome : dans une grille de 12 offres, six couleurs de
 * categorie transformeraient la page en nuancier. La distinction se fait par
 * le texte, pas par la teinte. Seul le survol revele l'accent bleu roi.
 */
export function CategoryTag({ category, variant = 'short', className }: CategoryTagProps) {
  const meta = CATEGORIES[category];
  const label =
    variant === 'code' ? meta.code : variant === 'full' ? meta.label : meta.short;

  return (
    <span
      title={meta.label}
      className={cn(
        'inline-flex items-center rounded-pill border border-line bg-white',
        'px-2.5 py-1 text-overline font-semibold uppercase tracking-[0.14em] text-ink-muted',
        'transition-colors duration-150 ease-editorial',
        'group-hover:border-royal-200 group-hover:bg-royal-50 group-hover:text-royal-700',
        className,
      )}
    >
      {label}
    </span>
  );
}

/** Liste de tags, avec compteur de debordement pour garder la carte courte. */
export function CategoryTagList({
  categories,
  max = 3,
  variant = 'short',
}: {
  categories: Category[];
  max?: number;
  variant?: CategoryTagProps['variant'];
}) {
  const visible = categories.slice(0, max);
  const overflow = categories.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((category) => (
        <CategoryTag key={category} category={category} variant={variant} />
      ))}
      {overflow > 0 && (
        <span className="text-caption text-ink-subtle tabular">+{overflow}</span>
      )}
    </div>
  );
}
