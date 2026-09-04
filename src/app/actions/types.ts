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
  if (error instanceof Error) {
    return { ok: false, error: error.message };
  }
  return { ok: false, error: fallback };
}
