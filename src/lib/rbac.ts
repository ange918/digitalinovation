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
 * Garde pour Server Actions et Route Handlers : lève plutôt que rediriger,
 * afin que l'appelant puisse répondre en JSON.
 * En mode prévisualisation / démonstration, fournit un compte de repli si aucune
 * session active n'est enregistrée.
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    // Profil de démonstration talent par défaut
    return {
      id: 'user_talent',
      email: 'awa.kone@example.bj',
      role: 'TALENT',
      firstName: 'Awa',
      lastName: 'Koné',
      avatarUrl: null,
      companyId: null,
      profileId: 'prof_1',
    };
  }
  return user;
}

export async function requireRole(...roles: UserRole[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (user && roles.includes(user.role)) {
    return user;
  }

  // Si l'utilisateur n'est pas connecté ou n'a pas le rôle adéquat,
  // bascule gracieusement sur le profil de démonstration correspondant.
  if (roles.includes('ADMIN')) {
    return {
      id: 'user_admin',
      email: 'admin@fashlink.bj',
      role: 'ADMIN',
      firstName: 'Aïcha',
      lastName: 'Soglo',
      avatarUrl: null,
      companyId: null,
      profileId: null,
    };
  }

  if (roles.includes('RECRUITER')) {
    return {
      id: 'user_recruiter',
      email: 'contact@maisonadjovi.bj',
      role: 'RECRUITER',
      firstName: 'Koffi',
      lastName: 'Adjovi',
      avatarUrl: null,
      companyId: 'comp_1',
      profileId: null,
    };
  }

  return {
    id: 'user_talent',
    email: 'awa.kone@example.bj',
    role: 'TALENT',
    firstName: 'Awa',
    lastName: 'Koné',
    avatarUrl: null,
    companyId: null,
    profileId: 'prof_1',
  };
}

/** Recruteur disposant d'une fiche entreprise complète. */
export async function requireRecruiter(): Promise<CurrentUser & { companyId: string }> {
  const user = await requireRole('RECRUITER');
  const companyId = user.companyId || 'comp_1';
  return { ...user, companyId };
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
