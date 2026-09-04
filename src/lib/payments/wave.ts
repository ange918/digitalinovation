import 'server-only';

import { createHmac } from 'node:crypto';

import type {
  CheckoutRequest,
  CheckoutSession,
  NormalizedWebhook,
  PaymentGateway,
} from '@/lib/payments/types';
import { safeEqual } from '@/lib/payments/cinetpay';

/**
 * Wave — paiement mobile a frais reduits, tres implante en zone UEMOA.
 *
 * Flux : POST /checkout/sessions -> `wave_launch_url`, puis webhook signe
 * `Wave-Signature: t=<timestamp>,v1=<hmac>` sur `t.rawBody`.
 */
export class WaveGateway implements PaymentGateway {
  readonly provider = 'WAVE' as const;

  private get config() {
    const apiKey = process.env.WAVE_API_KEY;
    const webhookSecret = process.env.WAVE_WEBHOOK_SECRET;
    const baseUrl = process.env.WAVE_BASE_URL ?? 'https://api.wave.com/v1';

    if (!apiKey || !webhookSecret) {
      throw new Error('Configuration Wave incomplete (voir .env.example).');
    }
    return { apiKey, webhookSecret, baseUrl };
  }

  async createCheckout(request: CheckoutRequest): Promise<CheckoutSession> {
    const { apiKey, baseUrl } = this.config;

    const response = await fetch(`${baseUrl}/checkout/sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // Wave deduplique les creations de session sur cette cle.
        'Idempotency-Key': request.reference,
      },
      body: JSON.stringify({
        amount: String(request.amountXof),
        currency: 'XOF',
        error_url: `${request.returnUrl}?statut=echec`,
        success_url: `${request.returnUrl}?statut=succes`,
        client_reference: request.reference,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Wave a refuse l'initialisation (${response.status}) : ${detail}`);
    }

    const body = (await response.json()) as { id?: string; wave_launch_url?: string };
    if (!body.wave_launch_url) {
      throw new Error("Wave n'a pas renvoye d'URL de paiement.");
    }

    return { paymentUrl: body.wave_launch_url, providerTransactionId: body.id ?? null };
  }

  async parseWebhook(rawBody: string, headers: Headers): Promise<NormalizedWebhook | null> {
    const { webhookSecret } = this.config;

    const header = headers.get('wave-signature');
    if (!header) return null;

    const parts = Object.fromEntries(
      header.split(',').map((chunk) => {
        const [key, value] = chunk.split('=');
        return [key?.trim(), value?.trim()];
      }),
    ) as { t?: string; v1?: string };

    if (!parts.t || !parts.v1) return null;

    // Fenetre de 5 minutes : bloque le rejeu d'un webhook intercepte.
    const ageSeconds = Math.abs(Date.now() / 1000 - Number(parts.t));
    if (!Number.isFinite(ageSeconds) || ageSeconds > 300) return null;

    const expected = createHmac('sha256', webhookSecret)
      .update(`${parts.t}.${rawBody}`)
      .digest('hex');

    if (!safeEqual(expected, parts.v1)) return null;

    const event = JSON.parse(rawBody) as {
      id?: string;
      type?: string;
      data?: {
        id?: string;
        client_reference?: string;
        payment_status?: string;
        amount?: string;
        currency?: string;
        sender_mobile?: string;
        last_payment_error?: { message?: string };
      };
    };

    const data = event.data ?? {};
    const status: NormalizedWebhook['status'] =
      data.payment_status === 'succeeded'
        ? 'SUCCEEDED'
        : data.payment_status === 'processing'
          ? 'PENDING'
          : data.payment_status === 'cancelled'
            ? 'CANCELED'
            : 'FAILED';

    return {
      provider: this.provider,
      eventId: event.id ?? `wave_${data.id ?? data.client_reference ?? parts.t}`,
      reference: data.client_reference ?? '',
      providerTransactionId: data.id ?? null,
      status,
      amountXof: data.amount != null ? Number(data.amount) : null,
      payerPhone: data.sender_mobile ?? null,
      failureReason: data.last_payment_error?.message ?? null,
      raw: event,
    };
  }
}
