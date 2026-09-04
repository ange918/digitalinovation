import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Fusionne des classes Tailwind en resolvant les conflits.
 * `cn('px-2', 'px-4')` -> `px-4`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate un montant en francs CFA.
 * Le XOF n'a pas de subdivision en usage : jamais de decimales.
 */
export function formatXof(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Fourchette de remuneration affichable, ou null si le recruteur ne la publie pas.
 */
export function formatSalaryRange(
  min: number | null,
  max: number | null,
  period: string | null,
  show: boolean,
): string | null {
  if (!show) return null;
  if (min == null && max == null) return null;

  const suffix =
    period === 'JOUR' ? ' / jour' : period === 'MISSION' ? ' / mission' : ' / mois';

  if (min != null && max != null) {
    if (min === max) return `${formatXof(min)}${suffix}`;
    return `${formatXof(min)} – ${formatXof(max)}${suffix}`;
  }
  if (min != null) return `A partir de ${formatXof(min)}${suffix}`;
  return `Jusqu'a ${formatXof(max as number)}${suffix}`;
}

/**
 * Date relative courte en francais : « il y a 3 jours ».
 * Intl.RelativeTimeFormat evite d'embarquer une librairie de dates.
 */
export function formatRelativeDate(date: Date | string): string {
  const target = typeof date === 'string' ? new Date(date) : date;
  const diffMs = target.getTime() - Date.now();
  const diffDays = Math.round(diffMs / 86_400_000);

  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });

  if (Math.abs(diffDays) >= 30) {
    return rtf.format(Math.round(diffDays / 30), 'month');
  }
  if (Math.abs(diffDays) >= 1) {
    return rtf.format(diffDays, 'day');
  }
  const diffHours = Math.round(diffMs / 3_600_000);
  if (Math.abs(diffHours) >= 1) {
    return rtf.format(diffHours, 'hour');
  }
  return rtf.format(Math.round(diffMs / 60_000), 'minute');
}

/** Date longue : « 4 septembre 2026 ». */
export function formatLongDate(date: Date | string): string {
  const target = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(target);
}

/**
 * Slug URL sans accents ni caracteres speciaux.
 * `suffix` garantit l'unicite sans aller-retour en base.
 */
export function slugify(input: string, suffix?: string): string {
  const base = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // retire les diacritiques
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return suffix ? `${base}-${suffix}` : base;
}

/** Identifiant court alphanumerique, pour suffixer les slugs. */
export function shortId(length = 6): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i += 1) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

/** Initiales pour les avatars de repli. */
export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
