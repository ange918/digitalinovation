import 'server-only';

import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@prisma/client';

import { prisma } from '@/lib/prisma';

const ACCESS_COOKIE = 'fl_session';
const REFRESH_COOKIE = 'fl_refresh';

const ACCESS_TTL = Number(process.env.JWT_ACCESS_TTL ?? 900);
const REFRESH_TTL = Number(process.env.JWT_REFRESH_TTL ?? 2_592_000);

function secretKey(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ||
    'fashlink_default_secure_preview_secret_key_minimum_48_bytes_length_for_jose_auth';
  return new TextEncoder().encode(secret);
}

export interface SessionClaims {
  sub: string;
  email: string;
  role: UserRole;
}

// --- Mots de passe ----------------------------------------------------------

/** Cout 12 : ~250 ms sur un runtime serverless, acceptable a la connexion. */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// --- Jetons -----------------------------------------------------------------

export async function signAccessToken(claims: SessionClaims): Promise<string> {
  return new SignJWT({ email: claims.email, role: claims.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setIssuer('fashlink')
    .setExpirationTime(`${ACCESS_TTL}s`)
    .sign(secretKey());
}

export async function verifyAccessToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: 'fashlink' });
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      email: String(payload.email ?? ''),
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

/** Le refresh token est opaque : seul son SHA-256 est persiste. */
export function generateRefreshToken(): { token: string; hash: string } {
  const token = randomBytes(48).toString('base64url');
  return { token, hash: sha256(token) };
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

// --- Cookies ----------------------------------------------------------------

export async function setSessionCookies(accessToken: string, refreshToken: string) {
  const store = await cookies();
  const secure = process.env.NODE_ENV === 'production';

  store.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TTL,
  });

  store.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    // Restreint au seul endpoint de rafraichissement : reduit la surface de vol.
    path: '/api/auth',
    maxAge: REFRESH_TTL,
  });
}

export async function clearSessionCookies() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function readRefreshCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value ?? null;
}

// --- Session courante -------------------------------------------------------

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  companyId: string | null;
  profileId: string | null;
}

/**
 * Utilisateur courant, ou null.
 * Relit la base pour que role et statut refletent l'etat reel : un compte
 * suspendu perd immediatement l'acces, sans attendre l'expiration du JWT.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const store = await cookies();
    const token = store.get(ACCESS_COOKIE)?.value;
    if (!token) return null;

    const claims = await verifyAccessToken(token);
    if (!claims) return null;

    const user = await prisma.user.findFirst({
      where: { id: claims.sub, status: 'ACTIVE', deletedAt: null },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        company: { select: { id: true } },
        profile: { select: { id: true } },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      companyId: user.company?.id ?? null,
      profileId: user.profile?.id ?? null,
    };
  } catch {
    return null;
  }
}
