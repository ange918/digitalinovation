import { handlePaymentWebhook } from '@/lib/webhook-handler';

/**
 * Webhook CinetPay.
 * URL a declarer chez le prestataire : {NEXT_PUBLIC_APP_URL}/api/webhooks/cinetpay
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return handlePaymentWebhook(request, 'CINETPAY');
}

/** Certains prestataires verifient l'accessibilite de l'URL en GET. */
export async function GET() {
  return new Response(JSON.stringify({ status: 'ok', provider: 'CINETPAY' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
