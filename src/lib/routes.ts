/**
 * Table des routes par role.
 *
 * Volontairement hors des fichiers `'use server'` : un module de Server Actions
 * ne peut exporter que des fonctions asynchrones, or ce helper est synchrone et
 * doit rester utilisable depuis le middleware et les composants.
 */
export function landingPathForRole(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'RECRUITER':
      return '/recruteur';
    default:
      return '/talent';
  }
}

/** Prefixes proteges et roles autorises, utilises par le middleware. */
export const PROTECTED_PREFIXES: { prefix: string; roles: string[] }[] = [
  { prefix: '/admin', roles: ['ADMIN'] },
  { prefix: '/recruteur', roles: ['RECRUITER', 'ADMIN'] },
  { prefix: '/talent', roles: ['TALENT', 'ADMIN'] },
];
