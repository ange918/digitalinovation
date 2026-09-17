-- Retrait des modules abonnement et paiement.
--
-- Les modeles avaient ete supprimes du schema (commit « remove subscription and
-- payment modules ») sans migration correspondante : le schema Prisma et la
-- base avaient diverge. FASHLINK ne vend pas d'abonnement aux maisons — la
-- maison paie FASHLINK par placement, ce que porte desormais `placements`.

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_companyId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_companyId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_planId_fkey";

-- DropTable
DROP TABLE "payments";

-- DropTable
DROP TABLE "plans";

-- DropTable
DROP TABLE "subscriptions";

-- DropTable
DROP TABLE "webhook_events";

-- DropEnum
DROP TYPE "PaymentProvider";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "PlanTier";

-- DropEnum
DROP TYPE "SubscriptionStatus";
