/**
 * URL publique de l'application.
 *
 * Resolue par un helper plutot que lue directement, car
 * `process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'` a un defaut
 * subtil : `??` ne se declenche que sur `undefined` ou `null`. Une variable
 * **definie mais vide** — ce que produit un projet Vercel ou le champ existe
 * sans valeur — passe le repli et fait echouer `new URL('')` avec
 * `ERR_INVALID_URL`, au moment de la collecte des metadonnees. Le build casse
 * alors qu'il a compile sans erreur.
 *
 * Ordre de resolution :
 *  1. `NEXT_PUBLIC_APP_URL`, si elle est non vide ET analysable ;
 *  2. l'hote fourni par Vercel, toujours present sur un deploiement ;
 *  3. localhost, pour le developpement.
 */
export function getAppUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (explicit) {
    try {
      // Valide reellement la valeur : une URL malformee vaut une absente.
      return new URL(explicit).origin;
    } catch {
      console.warn(
        `[app-url] NEXT_PUBLIC_APP_URL est invalide ("${explicit}") — repli sur l'hote Vercel.`,
      );
    }
  }

  const vercelHost = (
    process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL
  )?.trim();

  if (vercelHost) {
    return `https://${vercelHost.replace(/^https?:\/\//, '')}`;
  }

  return 'http://localhost:3000';
}
