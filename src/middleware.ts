import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

import { PROTECTED_PREFIXES } from '@/lib/routes';

/**
 * Premiere barriere d'acces, executee a la peripherie.
 *
 * Elle ne fait que verifier la signature et le role du jeton : c'est un filtre
 * de confort qui evite de rendre une page pour rien. L'autorisation reelle est
 * refaite dans chaque Server Action et Server Component via `@/lib/rbac`, car
 * le middleware ne peut pas interroger la base (runtime Edge) et ignore donc
 * qu'un compte vient d'etre suspendu.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rule = PROTECTED_PREFIXES.find(
    (entry) => pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`),
  );

  if (!rule) return NextResponse.next();

  const token = request.cookies.get('fl_session')?.value;
  if (!token) return redirectToLogin(request, pathname);

  const secret =
    process.env.JWT_SECRET ||
    'fashlink_default_secure_preview_secret_key_minimum_48_bytes_length_for_jose_auth';

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      issuer: 'fashlink',
    });

    const role = String(payload.role ?? '');
    if (!rule.roles.includes(role)) {
      return NextResponse.redirect(new URL('/403', request.url));
    }

    return NextResponse.next();
  } catch {
    // Jeton expire ou falsifie : on repart de la connexion.
    return redirectToLogin(request, pathname);
  }
}

function redirectToLogin(request: NextRequest, from: string) {
  const url = new URL('/connexion', request.url);
  url.searchParams.set('next', from);
  return NextResponse.redirect(url);
}

export const config = {
  // Exclut les assets statiques et les webhooks (signes, jamais porteurs de cookie).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico)$).*)'],
};
