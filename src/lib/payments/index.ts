import 'server-only';

import type { PaymentProvider } from '@prisma/client';

import { CinetPayGateway } from '@/lib/payments/cinetpay';
import { MtnMomoGateway } from '@/lib/payments/mtn-momo';
import { WaveGateway } from '@/lib/payments/wave';
import type { PaymentGateway } from '@/lib/payments/types';

/**
 * Fabrique de passerelles. Ajouter un prestataire = implementer
 * `PaymentGateway` et l'enregistrer ici ; aucun autre fichier ne change.
 */
export function getGateway(provider: PaymentProvider): PaymentGateway {
  switch (provider) {
    case 'CINETPAY':
      return new CinetPayGateway();
    case 'WAVE':
      return new WaveGateway();
    case 'MTN_MOMO':
      return new MtnMomoGateway();
    default:
      throw new Error(`Prestataire de paiement non supporte : ${provider}`);
  }
}

export const SUPPORTED_PROVIDERS: {
  provider: PaymentProvider;
  label: string;
  hint: string;
}[] = [
  {
    provider: 'CINETPAY',
    label: 'CinetPay',
    hint: 'MTN, Moov, Celtiis, carte bancaire — recommande.',
  },
  { provider: 'WAVE', label: 'Wave', hint: 'Frais reduits, paiement par QR ou numero.' },
  { provider: 'MTN_MOMO', label: 'MTN MoMo', hint: 'Validation directe par code USSD.' },
];

export * from '@/lib/payments/types';
