import { ZodError } from 'zod';

/**
 * Resultat uniforme des Server Actions.
 *
 * On ne laisse jamais une exception remonter au client : Next.js masque les
 * messages d'erreur en production, le talent verrait « une erreur est
 * survenue ». Un resultat type permet d'afficher un message utile.
 */
export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { ok: false; error: string };

export function actionError(error: unknown, fallback: string): { ok: false; error: string } {
  // Une ZodError est bien une Error, mais son `message` est un dump JSON des
  // problemes rencontres. Affiche tel quel, il est illisible : on en extrait
  // les messages de validation, qui sont deja rediges en francais.
  if (error instanceof ZodError) {
    const messages = [...new Set(error.issues.map((issue) => issue.message))];
    return { ok: false, error: messages.slice(0, 3).join(' ') || fallback };
  }

  // Violation de contrainte d'unicite. Sans ce garde, l'utilisateur recevrait
  // le message brut de Prisma (« Unique constraint failed on the fields... »).
  // Duck typing volontaire : importer `Prisma` ici embarquerait le client dans
  // le bundle navigateur, alors que ce module est partage avec l'interface.
  const unique = uniqueConstraintMessage(error);
  if (unique) {
    return { ok: false, error: unique };
  }

  if (error instanceof Error) {
    return { ok: false, error: error.message };
  }

  return { ok: false, error: fallback };
}

/**
 * Messages complets par champ : l'accord grammatical differe selon le genre
 * du sujet, une phrase a trous ne peut pas convenir aux deux.
 */
const UNIQUE_FIELD_MESSAGES: Record<string, string> = {
  email: 'Cette adresse e-mail est déjà utilisée par un autre compte.',
  phone: 'Ce numéro de téléphone est déjà rattaché à un autre compte.',
  slug: 'Ce nom est déjà pris. Choisissez-en un autre.',
  reference: 'Cette référence de paiement existe déjà.',
  providerTransactionId: 'Cette transaction a déjà été enregistrée.',
};

/**
 * Detecte une erreur Prisma P2002 et renvoie le message adapte au champ.
 * Retourne null pour toute autre erreur.
 */
function uniqueConstraintMessage(error: unknown): string | null {
  if (typeof error !== 'object' || error === null) return null;

  const candidate = error as { code?: unknown; meta?: { target?: unknown } };
  if (candidate.code !== 'P2002') return null;

  const target = candidate.meta?.target;
  const fields = Array.isArray(target)
    ? target.map(String)
    : typeof target === 'string'
      ? [target]
      : [];

  for (const field of fields) {
    if (UNIQUE_FIELD_MESSAGES[field]) return UNIQUE_FIELD_MESSAGES[field];
  }

  return 'Cette valeur est déjà utilisée par un autre compte.';
}
