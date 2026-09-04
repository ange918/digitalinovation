import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';

import type {
  CheckoutRequest,
  CheckoutSession,
  NormalizedWebhook,
  PaymentGateway,
} from '@/lib/payments/types';

/**
 * CinetPay — agregateur mobile money le plus couvrant en Afrique de l'Ouest
 * (MTN, Moov, Celtiis au Benin, Orange et Wave en zone UEMOA).
 *
 * Flux :
 *  1. POST /payment  -> renvoie une `payment_url` d'un formulaire hebergé.
 *  2. Le client paie depuis son telephone.
 *  3. CinetPay POSTe sur `notify_url` avec un en-tete `x-token` (HMAC-SHA256).
 *  4. On re-verifie le statut via /payment/check avant de crediter — le webhook
 *     seul ne suffit jamais a valider un encaissement.
 */
export class CinetPayGateway implements PaymentGateway {
  readonly provider = 'CINETPAY' as const;

  private get config() {
    const apiKey = process.env.CINETPAY_API_KEY;
    const siteId = process.env.CINETPAY_SITE_ID;
    const secretKey = process.env.CINETPAY_SECRET_KEY;
    const baseUrl = process.env.CINETPAY_BASE_URL ?? 'https://api-checkout.cinetpay.com/v2';

    if (!apiKey || !siteId || !secretKey) {
      throw new Error('Configuration CinetPay incomplete (voir .env.example).');
    }
    return { apiKey, siteId, secretKey, baseUrl };
  }

  async createCheckout(request: CheckoutRequest): Promise<CheckoutSession> {
    const { apiKey, siteId, baseUrl } = this.config;

    const response = await fetch(`${baseUrl}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: apiKey,
        site_id: siteId,
        transaction_id: request.reference,
        amount: request.amountXof,
        currency: 'XOF',
        description: request.description,
        customer_name: request.customerName,
        customer_email: request.customerEmail,
        customer_phone_number: request.customerPhone ?? undefined,
        channels: 'MOBILE_MONEY',
        return_url: request.returnUrl,
        notify_url: request.notifyUrl,
        lang: 'fr',
      }),
      cache: 'no-store',
    });

    const body = (await response.json()) as {
      code?: string;
      message?: string;
      data?: { payment_url?: string; payment_token?: string };
    };

    if (body.code !== '201' || !body.data?.payment_url) {
      throw new Error(`CinetPay a refuse l'initialisation : ${body.message ?? 'erreur inconnue'}`);
    }

    return {
      paymentUrl: body.data.payment_url,
      providerTransactionId: body.data.payment_token ?? null,
    };
  }

  async parseWebhook(rawBody: string, headers: Headers): Promise<NormalizedWebhook | null> {
    const { secretKey } = this.config;
    const token = headers.get('x-token');
    if (!token) return null;

    const params = new URLSearchParams(rawBody);
    const payload = Object.fromEntries(params.entries());

    // CinetPay signe la concatenation ordonnee des champs du formulaire.
    const signatureBase = [
      payload.cpm_site_id,
      payload.cpm_trans_id,
      payload.cpm_trans_date,
      payload.cpm_amount,
      payload.cpm_currency,
      payload.signature,
      payload.payment_method,
      payload.cel_phone_num,
      payload.cpm_phone_prefixe,
      payload.cpm_language,
      payload.cpm_version,
      payload.cpm_payment_config,
      payload.cpm_page_action,
      payload.cpm_custom,
      payload.cpm_designation,
      payload.cpm_error_message,
    ]
      .map((value) => value ?? '')
      .join('');

    const expected = createHmac('sha256', secretKey).update(signatureBase).digest('hex');
    if (!safeEqual(expected, token)) return null;

    // Le webhook annonce l'evenement ; /payment/check fait foi sur le statut.
    const confirmed = await this.checkTransaction(payload.cpm_trans_id);

    return {
      provider: this.provider,
      eventId: `cinetpay_${payload.cpm_trans_id}_${payload.cpm_trans_date ?? ''}`,
      reference: payload.cpm_trans_id,
      providerTransactionId: confirmed.operatorId,
      status: confirmed.status,
      amountXof: confirmed.amount,
      payerPhone: payload.cel_phone_num
        ? `${payload.cpm_phone_prefixe ?? ''}${payload.cel_phone_num}`
        : null,
      failureReason: confirmed.status === 'FAILED' ? confirmed.message : null,
      raw: payload,
    };
  }

  /** Verification serveur a serveur du statut reel d'une transaction. */
  private async checkTransaction(transactionId: string): Promise<{
    status: NormalizedWebhook['status'];
    amount: number | null;
    operatorId: string | null;
    message: string;
  }> {
    const { apiKey, siteId, baseUrl } = this.config;

    const response = await fetch(`${baseUrl}/payment/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apikey: apiKey, site_id: siteId, transaction_id: transactionId }),
      cache: 'no-store',
    });

    const body = (await response.json()) as {
      code?: string;
      message?: string;
      data?: { status?: string; amount?: string | number; operator_id?: string };
    };

    const map: Record<string, NormalizedWebhook['status']> = {
      ACCEPTED: 'SUCCEEDED',
      COMPLETED: 'SUCCEEDED',
      REFUSED: 'FAILED',
      CANCELED: 'CANCELED',
      PENDING: 'PENDING',
      WAITING_FOR_CUSTOMER: 'PENDING',
    };

    return {
      status: map[body.data?.status ?? ''] ?? (body.code === '00' ? 'SUCCEEDED' : 'FAILED'),
      amount: body.data?.amount != null ? Number(body.data.amount) : null,
      operatorId: body.data?.operator_id ?? null,
      message: body.message ?? 'Statut inconnu',
    };
  }
}

/** Comparaison a temps constant, resistante aux attaques temporelles. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
