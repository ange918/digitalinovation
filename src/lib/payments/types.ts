import type { PaymentProvider, PlanTier } from '@prisma/client';

export type BillingCycle = 'MONTHLY' | 'YEARLY';

export interface CheckoutRequest {
  reference: string;
  amountXof: number;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  returnUrl: string;
  notifyUrl: string;
}

export interface CheckoutSession {
  /** URL de paiement a ouvrir dans le navigateur du recruteur. */
  paymentUrl: string;
  /** Identifiant cote prestataire, quand il est connu des l'initialisation. */
  providerTransactionId?: string | null;
}

/** Resultat normalise de la lecture d'un webhook, tous prestataires confondus. */
export interface NormalizedWebhook {
  provider: PaymentProvider;
  /** Identifiant d'evenement, cle d'idempotence. */
  eventId: string;
  /** Reference FASHLINK transmise a l'initialisation. */
  reference: string;
  providerTransactionId: string | null;
  status: 'SUCCEEDED' | 'FAILED' | 'PENDING' | 'CANCELED';
  amountXof: number | null;
  payerPhone: string | null;
  failureReason: string | null;
  raw: unknown;
}

export interface PaymentGateway {
  provider: PaymentProvider;
  createCheckout(request: CheckoutRequest): Promise<CheckoutSession>;
  /**
   * Verifie la signature du webhook et normalise sa charge utile.
   * Retourne null si la signature est invalide : l'appelant repond alors 401
   * sans jamais toucher a la base.
   */
  parseWebhook(rawBody: string, headers: Headers): Promise<NormalizedWebhook | null>;
}

export interface PlanPurchaseIntent {
  tier: PlanTier;
  cycle: BillingCycle;
  provider: PaymentProvider;
}
