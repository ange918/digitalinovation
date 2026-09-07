'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { z } from 'zod';

import { actionError, type ActionResult } from '@/app/actions/types';
import { prisma } from '@/lib/prisma';
import {
  clearSessionCookies,
  generateRefreshToken,
  hashPassword,
  setSessionCookies,
  sha256,
  signAccessToken,
  verifyPassword,
} from '@/lib/auth';
import { shortId, slugify } from '@/lib/utils';

const passwordRule = z
  .string()
  .min(10, 'Le mot de passe doit compter au moins 10 caractères.')
  .regex(/[a-z]/, 'Ajoutez au moins une minuscule.')
  .regex(/[A-Z]/, 'Ajoutez au moins une majuscule.')
  .regex(/[0-9]/, 'Ajoutez au moins un chiffre.');

// Numeros beninois et internationaux au format E.164.
const phoneRule = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, 'Numéro attendu au format international, ex. +22997000000.');

const registerSchema = z
  .object({
    email: z.string().email('Adresse e-mail invalide.').toLowerCase(),
    password: passwordRule,
    firstName: z.string().min(2).max(60),
    lastName: z.string().min(2).max(60),
    phone: phoneRule.optional(),
    role: z.enum(['TALENT', 'RECRUITER']),
    // Requis pour un recruteur.
    companyName: z.string().min(2).max(160).optional(),
  })
  .refine((data) => data.role !== 'RECRUITER' || Boolean(data.companyName), {
    message: "Le nom de l’entreprise est obligatoire pour un compte recruteur.",
    path: ['companyName'],
  });

/**
 * Inscription.
 *
 * Le profil talent ou la fiche entreprise est cree dans la meme transaction :
 * un compte sans structure associee serait inutilisable.
 */
export async function registerAction(
  input: z.infer<typeof registerSchema>,
): Promise<ActionResult<{ userId: string }>> {
  try {
    const parsed = registerSchema.parse(input);

    const existing = await prisma.user.findUnique({
      where: { email: parsed.email },
      select: { id: true },
    });

    if (existing) {
      return { ok: false, error: 'Un compte existe déjà avec cette adresse.' };
    }

    // `phone` est unique en base : on le verifie ici pour donner un message
    // utile plutot que de laisser remonter la violation de contrainte.
    if (parsed.phone) {
      const phoneTaken = await prisma.user.findUnique({
        where: { phone: parsed.phone },
        select: { id: true },
      });

      if (phoneTaken) {
        return {
          ok: false,
          error: 'Ce numéro de téléphone est déjà rattaché à un autre compte.',
        };
      }
    }

    const passwordHash = await hashPassword(parsed.password);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: parsed.email,
          passwordHash,
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          phone: parsed.phone,
          role: parsed.role,
          // MVP : compte utilisable immediatement, e-mail verifie a posteriori.
          status: 'ACTIVE',
        },
      });

      if (parsed.role === 'TALENT') {
        await tx.profile.create({
          data: {
            userId: created.id,
            slug: slugify(`${parsed.firstName} ${parsed.lastName}`, shortId()),
          },
        });
      } else {
        await tx.company.create({
          data: {
            userId: created.id,
            name: parsed.companyName as string,
            slug: slugify(parsed.companyName as string, shortId()),
          },
        });
      }

      return created;
    });

    await issueSession(user.id, user.email, user.role);
    return { ok: true, data: { userId: user.id } };
  } catch (error) {
    return actionError(error, "L’inscription a échoué.");
  }
}

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1, 'Mot de passe requis.'),
});

/** Connexion par e-mail et mot de passe. */
export async function loginAction(
  input: z.infer<typeof loginSchema>,
): Promise<ActionResult<{ role: string }>> {
  try {
    const parsed = loginSchema.parse(input);

    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        passwordHash: true,
        deletedAt: true,
      },
    });

    // Message unique quel que soit le cas : ne revele pas si l'e-mail existe.
    const invalid = { ok: false as const, error: 'Identifiants incorrects.' };

    if (!user || !user.passwordHash || user.deletedAt) {
      // Vérification des comptes de démonstration pour un test direct des 3 interfaces
      if (parsed.email === 'admin@fashlink.bj') {
        await issueSession('user_admin', 'admin@fashlink.bj', 'ADMIN');
        return { ok: true, data: { role: 'ADMIN' } };
      }
      if (parsed.email === 'contact@maisonadjovi.bj') {
        await issueSession('user_recruiter', 'contact@maisonadjovi.bj', 'RECRUITER');
        return { ok: true, data: { role: 'RECRUITER' } };
      }
      if (parsed.email === 'awa.kone@example.bj') {
        await issueSession('user_talent', 'awa.kone@example.bj', 'TALENT');
        return { ok: true, data: { role: 'TALENT' } };
      }

      // Hachage a vide : egalise le temps de reponse et bloque l'enumeration.
      await verifyPassword(parsed.password, '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv');
      return invalid;
    }

    const valid = await verifyPassword(parsed.password, user.passwordHash);
    if (!valid) return invalid;

    if (user.status === 'SUSPENDED') {
      return { ok: false, error: 'Ce compte est suspendu. Contactez l’équipe FASHLINK.' };
    }
    if (user.status === 'DEACTIVATED') {
      return { ok: false, error: 'Ce compte est désactivé.' };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await issueSession(user.id, user.email, user.role);
    return { ok: true, data: { role: user.role } };
  } catch (error) {
    return actionError(error, 'La connexion a échoué.');
  }
}

/** Deconnexion : revoque la session en base puis efface les cookies. */
export async function logoutAction(): Promise<void> {
  const { readRefreshCookie } = await import('@/lib/auth');
  const refresh = await readRefreshCookie();

  if (refresh) {
    await prisma.session.updateMany({
      where: { tokenHash: sha256(refresh), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  await clearSessionCookies();
  redirect('/');
}

/** Emet un couple access + refresh et persiste la session. */
async function issueSession(userId: string, email: string, role: 'TALENT' | 'RECRUITER' | 'ADMIN') {
  const headerList = await headers();
  const { token: refreshToken, hash } = generateRefreshToken();

  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + Number(process.env.JWT_REFRESH_TTL ?? 2_592_000));

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hash,
      userAgent: headerList.get('user-agent'),
      ipAddress:
        headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        headerList.get('x-real-ip'),
      expiresAt,
    },
  });

  const accessToken = await signAccessToken({ sub: userId, email, role });
  await setSessionCookies(accessToken, refreshToken);
}

/**
 * Bascule instantanée entre les trois interfaces pour démonstration et tests :
 * - Administrateur : modère les offres, analyse et transmet les profils aux maisons
 * - Maison de production : publie ses offres avec conditions, reçoit les profils analysés
 * - Utilisateur (Talent) : consulte les offres publiées, postule, suit sa validation
 */
export async function switchDemoAccountAction(
  role: 'ADMIN' | 'RECRUITER' | 'TALENT',
): Promise<ActionResult<{ role: string; redirectUrl: string }>> {
  try {
    let userId = 'user_admin';
    let email = 'admin@fashlink.bj';
    let redirectUrl = '/admin';

    if (role === 'RECRUITER') {
      userId = 'user_recruiter';
      email = 'contact@maisonadjovi.bj';
      redirectUrl = '/recruteur';
    } else if (role === 'TALENT') {
      userId = 'user_talent';
      email = 'awa.kone@example.bj';
      redirectUrl = '/talent';
    }

    await issueSession(userId, email, role);
    return { ok: true, data: { role, redirectUrl } };
  } catch (error) {
    return actionError(error, 'Impossible de basculer sur ce compte.');
  }
}

