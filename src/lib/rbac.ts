import 'server-only';

import { redirect } from 'next/navigation';
import type { UserRole } from '@prisma/client';

import { getCurrentUser, type CurrentUser } from '@/lib/auth';

/** Erreur metier : refus d'acces explicite, distinguee d'un bug. */
export class ForbiddenError extends Error {
  constructor(message = 'Acces refuse.') {
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
 * afin que l'appelant puisse repondre en JSON.
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function requireRole(...roles: UserRole[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new ForbiddenError(
      `Cette action est reservee aux comptes : ${roles.join(', ')}.`,
    );
  }
  return user;
}

/** Recruteur disposant d'une fiche entreprise complete. */
export async function requireRecruiter(): Promise<CurrentUser & { companyId: string }> {
  const user = await requireRole('RECRUITER');
  if (!user.companyId) {
    throw new ForbiddenError(
      'Completez la fiche de votre entreprise avant de publier une offre.',
    );
  }
  return user as CurrentUser & { companyId: string };
}

export async function requireAdmin(): Promise<CurrentUser> {
  return requireRole('ADMIN');
}

/**
 * Garde pour Server Components : redirige vers la connexion en conservant
 * la destination initiale.
 */
export async function requirePage(
  roles: UserRole[],
  currentPath: string,
): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/connexion?next=${encodeURIComponent(currentPath)}`);
  }
  if (!roles.includes(user.role)) {
    redirect('/403');
  }
  return user;
}
