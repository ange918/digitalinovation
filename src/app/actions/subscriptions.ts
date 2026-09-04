'use server';

import { z } from 'zod';

import { actionError, type ActionResult } from '@/app/actions/types';
import { prisma } from '@/lib/prisma';
import { requireRecruiter } from '@/lib/rbac';
import { getGateway } from '@/lib/payments';
import { getPlan } from '@/lib/billing';
import { buildPaymentReference } from '@/lib/subscription-activation';

const checkoutSchema = z.object({
  tier: z.enum(['PRO', 'PREMIUM']),
  cycle: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
  provider: z.enum(['CINETPAY', 'WAVE', 'MTN_MOMO']),
  /** Obligatoire pour MTN MoMo : le push USSD part sur ce numero. */
  phone: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/, 'Numero attendu au format international.')
    .optional(),
});

/**
 * Ouvre une session de paiement chez le prestataire choisi.
 *
 * On enregistre le paiement en INITIATED avant de rediriger : si le webhook
 * arrive avant le retour du navigateur, la transaction existe deja et
 * l'activation se fait sans course.
 */
export async function createCheckoutAction(
  input: z.infer<typeof checkoutSchema>,
): Promise<ActionResult<{ paymentUrl: string; reference: string }>> {
  try {
    const parsed = checkoutSchema.parse(input);
    const recruiter = await requireRecruiter();

    if (parsed.provider === 'MTN_MOMO' && !parsed.phone) {
      return { ok: false, error: 'Renseignez votre numero MTN MoMo.' };
    }

    const plan = await getPlan(parsed.tier);
    const amountXof =
      parsed.cycle === 'YEARLY' ? (plan.priceYearlyXof ?? plan.priceXof * 12) : plan.priceXof;

    if (amountXof <= 0) {
      return { ok: false, error: 'Ce palier ne necessite pas de paiement.' };
    }

    const company = await prisma.company.findUnique({
      where: { id: recruiter.companyId },
      select: { id: true, name: true },
    });

    if (!company) return { ok: false, error: 'Fiche entreprise introuvable.' };

    const reference = buildPaymentReference(company.id, parsed.tier, parsed.cycle);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    await prisma.payment.create({
      data: {
        companyId: company.id,
        provider: parsed.provider,
        reference,
        amountXof,
        status: 'INITIATED',
        payerPhone: parsed.phone,
      },
    });

    const gateway = getGateway(parsed.provider);
    const session = await gateway.createCheckout({
      reference,
      amountXof,
      description: `FASHLINK ${plan.name} — ${parsed.cycle === 'YEARLY' ? '12 mois' : '1 mois'}`,
      customerName: company.name,
      customerEmail: recruiter.email,
      customerPhone: parsed.phone ?? null,
      returnUrl: `${appUrl}/recruteur/abonnement/retour`,
      notifyUrl: `${appUrl}/api/webhooks/${parsed.provider.toLowerCase().replace('_', '-')}`,
    });

    await prisma.payment.update({
      where: { reference },
      data: {
        status: 'PENDING',
        providerTransactionId: session.providerTransactionId,
      },
    });

    return { ok: true, data: { paymentUrl: session.paymentUrl, reference } };
  } catch (error) {
    return actionError(error, "L'initialisation du paiement a echoue.");
  }
}

const statusSchema = z.object({ reference: z.string().min(1) });

/**
 * Etat d'un paiement, interroge par la page d'attente.
 * Utilise pour MTN MoMo, ou aucune redirection ne signale la fin du paiement.
 */
export async function getPaymentStatusAction(
  input: z.infer<typeof statusSchema>,
): Promise<ActionResult<{ status: string; subscriptionActive: boolean }>> {
  try {
    const parsed = statusSchema.parse(input);
    const recruiter = await requireRecruiter();

    const payment = await prisma.payment.findFirst({
      where: { reference: parsed.reference, companyId: recruiter.companyId },
      select: { status: true, subscriptionId: true },
    });

    if (!payment) return { ok: false, error: 'Paiement introuvable.' };

    const active = payment.subscriptionId
      ? Boolean(
          await prisma.subscription.findFirst({
            where: { id: payment.subscriptionId, status: 'ACTIVE' },
            select: { id: true },
          }),
        )
      : false;

    return { ok: true, data: { status: payment.status, subscriptionActive: active } };
  } catch (error) {
    return actionError(error, 'Lecture du statut impossible.');
  }
}

/** Desactive le renouvellement : l'abonnement court jusqu'a son terme. */
export async function cancelSubscriptionAction(): Promise<ActionResult> {
  try {
    const recruiter = await requireRecruiter();

    const subscription = await prisma.subscription.findFirst({
      where: { companyId: recruiter.companyId, status: 'ACTIVE' },
      select: { id: true },
    });

    if (!subscription) return { ok: false, error: 'Aucun abonnement actif.' };

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { autoRenew: false, canceledAt: new Date() },
    });

    return { ok: true };
  } catch (error) {
    return actionError(error, 'La resiliation a echoue.');
  }
}
