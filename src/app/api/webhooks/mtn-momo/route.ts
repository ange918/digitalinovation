import { handlePaymentWebhook } from '@/lib/webhook-handler';

/**
 * Webhook MTN Mobile Money.
 * URL a declarer chez le prestataire : {NEXT_PUBLIC_APP_URL}/api/webhooks/mtn-momo
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return handlePaymentWebhook(request, 'MTN_MOMO');
}

/** Certains prestataires verifient l'accessibilite de l'URL en GET. */
export async function GET() {
  return new Response(JSON.stringify({ status: 'ok', provider: 'MTN_MOMO' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
