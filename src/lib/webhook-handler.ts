import 'server-only';

import { NextResponse } from 'next/server';
import type { PaymentProvider } from '@prisma/client';

import { getGateway } from '@/lib/payments';
import { applyPaymentWebhook } from '@/lib/subscription-activation';

/**
 * Traitement commun aux trois prestataires.
 *
 * Regle de reponse : on repond 200 des que l'evenement a ete pris en charge,
 * meme si l'activation n'a pas eu lieu (montant insuffisant, reference
 * inconnue). Un 500 declencherait des re-emissions en boucle chez le PSP
 * alors que le probleme ne se resoudra pas tout seul — ces cas partent en
 * regularisation manuelle via `WebhookEvent.error`.
 *
 * Seule une signature invalide renvoie 401, et une panne reelle renvoie 500
 * pour que le PSP rejoue.
 */
export async function handlePaymentWebhook(
  request: Request,
  provider: PaymentProvider,
): Promise<NextResponse> {
  // Le corps brut est indispensable : toute re-serialisation JSON casserait
  // le calcul de la signature HMAC.
  const rawBody = await request.text();

  let normalized;
  try {
    const gateway = getGateway(provider);
    normalized = await gateway.parseWebhook(rawBody, request.headers);
  } catch (error) {
    console.error(`[webhook:${provider}] lecture impossible`, error);
    return NextResponse.json({ error: 'Payload illisible.' }, { status: 400 });
  }

  if (!normalized) {
    console.warn(`[webhook:${provider}] signature invalide`);
    return NextResponse.json({ error: 'Signature invalide.' }, { status: 401 });
  }

  try {
    const outcome = await applyPaymentWebhook(normalized);
    return NextResponse.json({ received: true, ...outcome }, { status: 200 });
  } catch (error) {
    console.error(`[webhook:${provider}] traitement echoue`, error);
    // 500 : incident de notre cote, le prestataire doit rejouer.
    return NextResponse.json({ error: 'Traitement echoue.' }, { status: 500 });
  }
}
