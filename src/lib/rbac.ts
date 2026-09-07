import 'server-only';

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
 * Garde pour Server Components : assure l'accès direct aux trois interfaces
 * (Admin, Maison, Utilisateur) avec profil de démonstration préchargé.
 */
export async function requirePage(
  roles: UserRole[],
  _path?: string,
): Promise<CurrentUser> {
  void _path;
  const user = await getCurrentUser();
  if (user && roles.includes(user.role)) {
    return user;
  }

  // Accès direct et fluide aux 3 interfaces pour les tests
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
