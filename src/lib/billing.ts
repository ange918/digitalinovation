import 'server-only';

import type { Plan, PlanTier, Subscription } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { PLAN_CATALOG } from '@/lib/constants';

export interface Entitlements {
  tier: PlanTier;
  plan: Plan;
  subscription: Subscription | null;
  jobPostQuota: number;
  jobPostsUsed: number;
  /** -1 = illimite. */
  jobPostsRemaining: number;
  featuredRemaining: number;
  canSearchTalents: boolean;
  canExportApplications: boolean;
  periodEnd: Date | null;
}

/**
 * Droits effectifs d'une entreprise.
 *
 * Toute entreprise sans abonnement actif retombe sur STARTER : le compte reste
 * utilisable, seuls les quotas se resserrent. C'est ce qui permet de laisser
 * expirer un abonnement sans jamais bloquer un recruteur hors de son espace.
 */
export async function getEntitlements(companyId: string): Promise<Entitlements> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      companyId,
      status: 'ACTIVE',
      currentPeriodEnd: { gt: new Date() },
    },
    include: { plan: true },
    orderBy: { currentPeriodEnd: 'desc' },
  });

  const plan = subscription?.plan ?? (await getPlan('STARTER'));

  const jobPostsUsed = subscription?.jobPostsUsed ?? (await countActiveJobs(companyId));
  const featuredUsed = subscription?.featuredUsed ?? 0;

  return {
    tier: plan.tier,
    plan,
    subscription: subscription ?? null,
    jobPostQuota: plan.jobPostQuota,
    jobPostsUsed,
    jobPostsRemaining:
      plan.jobPostQuota === -1 ? -1 : Math.max(0, plan.jobPostQuota - jobPostsUsed),
    featuredRemaining: Math.max(0, plan.featuredQuota - featuredUsed),
    canSearchTalents: plan.canSearchTalents,
    canExportApplications: plan.canExportApplications,
    periodEnd: subscription?.currentPeriodEnd ?? null,
  };
}

/**
 * Recupere un plan, en le creant depuis le catalogue s'il manque.
 * Rend le systeme auto-reparable : un environnement fraichement migre
 * fonctionne sans avoir a lancer le seed.
 */
export async function getPlan(tier: PlanTier): Promise<Plan> {
  const existing = await prisma.plan.findUnique({ where: { tier } });
  if (existing) return existing;

  const spec = PLAN_CATALOG[tier];
  return prisma.plan.create({
    data: {
      tier,
      name: spec.name,
      description: spec.pitch,
      priceXof: spec.priceXof,
      priceYearlyXof: spec.priceYearlyXof,
      jobPostQuota: spec.jobPostQuota,
      featuredQuota: spec.featuredQuota,
      seatQuota: spec.seatQuota,
      canSearchTalents: spec.canSearchTalents,
      canExportApplications: spec.canExportApplications,
      hasPrioritySupport: spec.hasPrioritySupport,
    },
  });
}

/**
 * Offres occupant reellement un emplacement de quota.
 * Une offre rejetee, cloturee ou expiree libere sa place.
 */
function countActiveJobs(companyId: string): Promise<number> {
  return prisma.job.count({
    where: {
      companyId,
      deletedAt: null,
      status: { in: ['PENDING_VALIDATION', 'ACTIVE'] },
    },
  });
}

/** Verifie qu'une nouvelle offre peut etre soumise. */
export async function assertCanPublishJob(companyId: string): Promise<void> {
  const entitlements = await getEntitlements(companyId);
  if (entitlements.jobPostQuota === -1) return;

  const active = await countActiveJobs(companyId);
  if (active >= entitlements.jobPostQuota) {
    throw new Error(
      `Votre offre ${entitlements.plan.name} autorise ${entitlements.jobPostQuota} offre(s) active(s). ` +
        'Clôturez une offre en cours ou passez à un palier supérieur.',
    );
  }
}

/** Fin de periode pour un abonnement mensuel ou annuel. */
export function computePeriodEnd(from: Date, cycle: 'MONTHLY' | 'YEARLY'): Date {
  const end = new Date(from);
  if (cycle === 'YEARLY') {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }
  return end;
}
