import 'server-only';

import type { PaymentProvider, PlanTier } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { computePeriodEnd, getPlan } from '@/lib/billing';
import type { BillingCycle, NormalizedWebhook } from '@/lib/payments/types';

/**
 * Reference de paiement auto-portante : `FL-<tier>-<cycle>-<companyId>-<nonce>`.
 *
 * Elle voyage jusqu'au prestataire et revient dans le webhook. On y encode le
 * plan achete pour ne dependre d'aucun etat intermediaire : meme si le webhook
 * arrive avant que notre reponse HTTP d'initialisation soit ecrite, on sait
 * quoi activer.
 */
export function buildPaymentReference(
  companyId: string,
  tier: PlanTier,
  cycle: BillingCycle,
): string {
  const nonce = Date.now().toString(36).toUpperCase();
  return `FL-${tier}-${cycle}-${companyId}-${nonce}`;
}

export function parsePaymentReference(
  reference: string,
): { tier: PlanTier; cycle: BillingCycle; companyId: string } | null {
  const match = /^FL-(STARTER|PRO|PREMIUM)-(MONTHLY|YEARLY)-([^-]+)-[A-Z0-9]+$/.exec(reference);
  if (!match) return null;
  return {
    tier: match[1] as PlanTier,
    cycle: match[2] as BillingCycle,
    companyId: match[3],
  };
}

export type WebhookOutcome =
  | { handled: true; reason: 'ALREADY_PROCESSED' | 'ACTIVATED' | 'RECORDED_NON_SUCCESS' }
  | { handled: false; reason: string };

/**
 * Applique un webhook de paiement normalise.
 *
 * Garanties :
 *  - Idempotence : l'unicite (provider, eventId) sur `WebhookEvent` fait echouer
 *    tout rejeu avant la moindre ecriture metier.
 *  - Atomicite : creation du paiement, de l'abonnement et retrogradation de
 *    l'ancien se font dans une seule transaction.
 *  - Controle du montant : un paiement inferieur au prix du plan est enregistre
 *    mais n'active rien — la regularisation est manuelle.
 */
export async function applyPaymentWebhook(
  event: NormalizedWebhook,
): Promise<WebhookOutcome> {
  // 1. Verrou d'idempotence. La contrainte unique rejette le doublon.
  //
  // Note d'exploitation : sur un rejeu, Prisma journalise le P2002 au niveau
  // `error` avant que le catch ne l'absorbe. C'est le fonctionnement nominal,
  // pas un incident — les PSP rejouent leurs webhooks par conception.
  try {
    await prisma.webhookEvent.create({
      data: {
        provider: event.provider,
        eventId: event.eventId,
        payload: event.raw as object,
        attempts: 1,
      },
    });
  } catch {
    return { handled: true, reason: 'ALREADY_PROCESSED' };
  }

  const parsed = parsePaymentReference(event.reference);
  if (!parsed) {
    await markWebhookError(event, `Reference illisible : ${event.reference}`);
    return { handled: false, reason: 'INVALID_REFERENCE' };
  }

  const company = await prisma.company.findUnique({
    where: { id: parsed.companyId },
    include: { user: { select: { id: true } } },
  });

  if (!company) {
    await markWebhookError(event, `Entreprise introuvable : ${parsed.companyId}`);
    return { handled: false, reason: 'COMPANY_NOT_FOUND' };
  }

  // Controle anti-double-credit : une transaction du prestataire ne peut
  // financer qu'un seul paiement. Si son identifiant est deja rattache a une
  // AUTRE reference, on refuse et on escalade — c'est le scenario d'un
  // encaissement rejoue sous une reference differente.
  if (event.providerTransactionId) {
    const clash = await prisma.payment.findUnique({
      where: { providerTransactionId: event.providerTransactionId },
      select: { reference: true },
    });

    if (clash && clash.reference !== event.reference) {
      await markWebhookError(
        event,
        `Transaction ${event.providerTransactionId} deja rattachee a la reference ${clash.reference}.`,
      );
      return { handled: false, reason: 'DUPLICATE_TRANSACTION' };
    }
  }

  // 2. Echec ou attente : on trace la transaction, sans toucher aux droits.
  if (event.status !== 'SUCCEEDED') {
    await prisma.payment.upsert({
      where: { reference: event.reference },
      create: {
        companyId: company.id,
        provider: event.provider,
        reference: event.reference,
        providerTransactionId: event.providerTransactionId,
        amountXof: event.amountXof ?? 0,
        status: event.status,
        payerPhone: event.payerPhone,
        failureReason: event.failureReason,
        rawPayload: event.raw as object,
      },
      update: {
        status: event.status,
        providerTransactionId: event.providerTransactionId,
        failureReason: event.failureReason,
        rawPayload: event.raw as object,
      },
    });

    await markWebhookProcessed(event);
    return { handled: true, reason: 'RECORDED_NON_SUCCESS' };
  }

  // 3. Controle du montant encaisse.
  const plan = await getPlan(parsed.tier);
  const expected = parsed.cycle === 'YEARLY' ? (plan.priceYearlyXof ?? plan.priceXof * 12) : plan.priceXof;

  if (event.amountXof != null && event.amountXof < expected) {
    await prisma.payment.upsert({
      where: { reference: event.reference },
      create: {
        companyId: company.id,
        provider: event.provider,
        reference: event.reference,
        providerTransactionId: event.providerTransactionId,
        amountXof: event.amountXof,
        status: 'FAILED',
        payerPhone: event.payerPhone,
        failureReason: `Montant insuffisant : ${event.amountXof} XOF recus pour ${expected} XOF attendus.`,
        rawPayload: event.raw as object,
      },
      update: { status: 'FAILED' },
    });
    await markWebhookError(event, 'Montant insuffisant.');
    return { handled: false, reason: 'AMOUNT_MISMATCH' };
  }

  const now = new Date();
  const periodEnd = computePeriodEnd(now, parsed.cycle);

  // 4. Activation atomique.
  await prisma.$transaction(async (tx) => {
    // Un abonnement en cours devient EXPIRED : un seul actif a la fois.
    await tx.subscription.updateMany({
      where: { companyId: company.id, status: 'ACTIVE' },
      data: { status: 'EXPIRED', canceledAt: now },
    });

    const subscription = await tx.subscription.create({
      data: {
        companyId: company.id,
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        jobPostsUsed: 0,
        featuredUsed: 0,
      },
    });

    await tx.payment.upsert({
      where: { reference: event.reference },
      create: {
        companyId: company.id,
        subscriptionId: subscription.id,
        provider: event.provider,
        reference: event.reference,
        providerTransactionId: event.providerTransactionId,
        amountXof: event.amountXof ?? expected,
        status: 'SUCCEEDED',
        payerPhone: event.payerPhone,
        paidAt: now,
        rawPayload: event.raw as object,
      },
      update: {
        subscriptionId: subscription.id,
        status: 'SUCCEEDED',
        providerTransactionId: event.providerTransactionId,
        paidAt: now,
        rawPayload: event.raw as object,
      },
    });

    await tx.notification.create({
      data: {
        userId: company.user.id,
        type: 'SUBSCRIPTION_ACTIVATED',
        title: `Abonnement ${plan.name} active`,
        body: `Votre abonnement est actif jusqu'au ${periodEnd.toLocaleDateString('fr-FR')}.`,
        href: '/recruteur/abonnement',
        data: { subscriptionId: subscription.id, tier: plan.tier },
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: null,
        action: 'SUBSCRIPTION_ACTIVATED',
        entityType: 'Subscription',
        entityId: subscription.id,
        metadata: {
          provider: event.provider,
          reference: event.reference,
          amountXof: event.amountXof,
          tier: plan.tier,
        },
      },
    });
  });

  await markWebhookProcessed(event);
  return { handled: true, reason: 'ACTIVATED' };
}

async function markWebhookProcessed(event: NormalizedWebhook) {
  await prisma.webhookEvent.update({
    where: { provider_eventId: { provider: event.provider, eventId: event.eventId } },
    data: { processedAt: new Date() },
  });
}

async function markWebhookError(event: NormalizedWebhook, error: string) {
  await prisma.webhookEvent.update({
    where: { provider_eventId: { provider: event.provider, eventId: event.eventId } },
    data: { error, processedAt: new Date() },
  });
}

/** Prestataires actifs, pour l'affichage de la page d'abonnement. */
export function isProviderConfigured(provider: PaymentProvider): boolean {
  switch (provider) {
    case 'CINETPAY':
      return Boolean(process.env.CINETPAY_API_KEY && process.env.CINETPAY_SITE_ID);
    case 'WAVE':
      return Boolean(process.env.WAVE_API_KEY);
    case 'MTN_MOMO':
      return Boolean(process.env.MTN_MOMO_SUBSCRIPTION_KEY);
    default:
      return false;
  }
}
