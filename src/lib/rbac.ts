import 'server-only';

import { redirect } from 'next/navigation';

import type { UserRole } from '@prisma/client';

import { getCurrentUser, type CurrentUser } from '@/lib/auth';

/** Erreur metier : refus d'acces explicite, distinguee d'un bug. */
export class ForbiddenError extends Error {
  constructor(message = 'Accès refusé.') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Authentification requise.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Garde pour Server Actions et Route Handlers : leve plutot que rediriger,
 * afin que l'appelant puisse repondre en JSON. `actionError` transforme le
 * message en retour lisible cote interface.
 *
 * Ces gardes retournaient auparavant un compte de demonstration lorsqu'aucune
 * session n'etait active — un ADMIN fabrique pour `requireAdmin()`. Toutes les
 * actions d'administration (publier une demande, transmettre le profil d'un
 * talent a une maison) etaient donc executables sans compte. Elles refusent.
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError('Connectez-vous pour effectuer cette action.');
  }
  return user;
}

export async function requireRole(...roles: UserRole[]): Promise<CurrentUser> {
  const user = await requireUser();

  if (!roles.includes(user.role)) {
    throw new ForbiddenError("Votre compte n'a pas les droits requis pour cette action.");
  }

  return user;
}

/** Maison de mode disposant d'une fiche complete. */
export async function requireRecruiter(): Promise<CurrentUser & { companyId: string }> {
  const user = await requireRole('RECRUITER');

  if (!user.companyId) {
    throw new ForbiddenError(
      'Aucune maison n’est rattachée à ce compte. Complétez votre fiche avant de déposer une demande.',
    );
  }

  return { ...user, companyId: user.companyId };
}

export async function requireAdmin(): Promise<CurrentUser> {
  return requireRole('ADMIN');
}

/**
 * Garde pour Server Components.
 *
 * Elle avait ete neutralisee pour permettre de parcourir les trois interfaces
 * sans compte : elle retournait un utilisateur fabrique au lieu de refuser.
 * Le tableau de bord administrateur — qui donne vue sur l'ensemble des talents,
 * des maisons et de leurs demandes — devenait alors accessible a quiconque
 * franchissait le middleware. Seul ce dernier protegeait encore les routes,
 * sans defense en profondeur derriere lui.
 *
 * Elle refuse de nouveau : session absente ou expiree, on renvoie vers
 * l'aiguillage en ouvrant la modale d'authentification, `next` ramenant
 * l'utilisateur ou il voulait aller ; role insuffisant, on renvoie vers /403.
 *
 * Pour parcourir les interfaces en developpement, les comptes du jeu de
 * demonstration font l'affaire (voir `prisma/seed.ts`).
 */
export async function requirePage(
  roles: UserRole[],
  currentPath: string,
): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/?auth=connexion&next=${encodeURIComponent(currentPath)}`);
  }

  if (!roles.includes(user.role)) {
    redirect('/403');
  }

  return user;
}
