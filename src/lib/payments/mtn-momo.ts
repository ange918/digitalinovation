import 'server-only';

import { createHmac, randomUUID } from 'node:crypto';

import type {
  CheckoutRequest,
  CheckoutSession,
  NormalizedWebhook,
  PaymentGateway,
} from '@/lib/payments/types';
import { safeEqual } from '@/lib/payments/cinetpay';

/**
 * MTN Mobile Money — API Collection (requestToPay).
 *
 * Particularite : il n'y a pas de page de paiement hebergee. On declenche un
 * push USSD sur le telephone du client, qui saisit son code sur son mobile.
 * `paymentUrl` renvoie donc vers une page FASHLINK d'attente qui interroge
 * le statut, et non vers un formulaire externe.
 */
export class MtnMomoGateway implements PaymentGateway {
  readonly provider = 'MTN_MOMO' as const;

  private get config() {
    const subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
    const apiUser = process.env.MTN_MOMO_API_USER;
    const apiKey = process.env.MTN_MOMO_API_KEY;
    const target = process.env.MTN_MOMO_TARGET_ENVIRONMENT ?? 'sandbox';
    const baseUrl = process.env.MTN_MOMO_BASE_URL ?? 'https://sandbox.momodeveloper.mtn.com';
    const webhookSecret = process.env.MTN_MOMO_WEBHOOK_SECRET;

    if (!subscriptionKey || !apiUser || !apiKey) {
      throw new Error('Configuration MTN MoMo incomplete (voir .env.example).');
    }
    return { subscriptionKey, apiUser, apiKey, target, baseUrl, webhookSecret };
  }

  /** Jeton OAuth valable une heure ; obtenu a chaque initialisation. */
  private async accessToken(): Promise<string> {
    const { subscriptionKey, apiUser, apiKey, baseUrl } = this.config;
    const basic = Buffer.from(`${apiUser}:${apiKey}`).toString('base64');

    const response = await fetch(`${baseUrl}/collection/token/`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Ocp-Apim-Subscription-Key': subscriptionKey,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`MTN MoMo : obtention du jeton impossible (${response.status}).`);
    }

    const body = (await response.json()) as { access_token?: string };
    if (!body.access_token) throw new Error('MTN MoMo : jeton absent de la reponse.');
    return body.access_token;
  }

  async createCheckout(request: CheckoutRequest): Promise<CheckoutSession> {
    const { subscriptionKey, target, baseUrl } = this.config;

    if (!request.customerPhone) {
      throw new Error('Le numero Mobile Money est obligatoire pour un paiement MTN.');
    }

    const token = await this.accessToken();
    const referenceId = randomUUID();

    const response = await fetch(`${baseUrl}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': target,
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-Type': 'application/json',
        'X-Callback-Url': request.notifyUrl,
      },
      body: JSON.stringify({
        amount: String(request.amountXof),
        currency: 'XOF',
        externalId: request.reference,
        payer: {
          partyIdType: 'MSISDN',
          // MSISDN sans le « + » initial.
          partyId: request.customerPhone.replace(/^\+/, ''),
        },
        payerMessage: request.description,
        payeeNote: 'FASHLINK',
      }),
      cache: 'no-store',
    });

    // 202 Accepted : la demande est partie, le client doit valider sur son mobile.
    if (response.status !== 202) {
      const detail = await response.text();
      throw new Error(`MTN MoMo a refuse la demande (${response.status}) : ${detail}`);
    }

    return {
      paymentUrl: `/recruteur/abonnement/attente?ref=${encodeURIComponent(request.reference)}`,
      providerTransactionId: referenceId,
    };
  }

  async parseWebhook(rawBody: string, headers: Headers): Promise<NormalizedWebhook | null> {
    const { webhookSecret } = this.config;

    // MTN ne signe pas systematiquement : si un secret est configure, on exige
    // la signature ; sinon on s'appuie sur l'URL de callback secrete.
    if (webhookSecret) {
      const signature = headers.get('x-signature');
      if (!signature) return null;
      const expected = createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
      if (!safeEqual(expected, signature)) return null;
    }

    const event = JSON.parse(rawBody) as {
      externalId?: string;
      financialTransactionId?: string;
      status?: string;
      amount?: string;
      payer?: { partyId?: string };
      reason?: string | { message?: string };
    };

    const status: NormalizedWebhook['status'] =
      event.status === 'SUCCESSFUL'
        ? 'SUCCEEDED'
        : event.status === 'PENDING'
          ? 'PENDING'
          : 'FAILED';

    return {
      provider: this.provider,
      eventId: `mtn_${event.financialTransactionId ?? event.externalId ?? randomUUID()}`,
      reference: event.externalId ?? '',
      providerTransactionId: event.financialTransactionId ?? null,
      status,
      amountXof: event.amount != null ? Number(event.amount) : null,
      payerPhone: event.payer?.partyId ? `+${event.payer.partyId}` : null,
      failureReason:
        typeof event.reason === 'string' ? event.reason : (event.reason?.message ?? null),
      raw: event,
    };
  }
}
