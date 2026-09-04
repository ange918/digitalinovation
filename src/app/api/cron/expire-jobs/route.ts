import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Tache quotidienne (Vercel Cron) :
 *  1. bascule les offres arrivees a echeance en EXPIRED et libere leur quota ;
 *  2. termine les abonnements dont la periode est passee ;
 *  3. previent les recruteurs dont l'offre expire sous 3 jours.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get('authorization');

  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorise.' }, { status: 401 });
  }

  const now = new Date();

  const expiring = await prisma.job.findMany({
    where: { status: 'ACTIVE', expiresAt: { lte: now } },
    select: { id: true, companyId: true },
  });

  const expiredJobs = await prisma.job.updateMany({
    where: { id: { in: expiring.map((job) => job.id) } },
    data: { status: 'EXPIRED' },
  });

  // Libere un emplacement de quota par offre expiree.
  for (const job of expiring) {
    await prisma.subscription.updateMany({
      where: { companyId: job.companyId, status: 'ACTIVE', jobPostsUsed: { gt: 0 } },
      data: { jobPostsUsed: { decrement: 1 } },
    });
  }

  const expiredSubscriptions = await prisma.subscription.updateMany({
    where: { status: 'ACTIVE', currentPeriodEnd: { lte: now } },
    data: { status: 'EXPIRED' },
  });

  // Rappel a J-3.
  const soon = new Date(now);
  soon.setDate(soon.getDate() + 3);

  const endingSoon = await prisma.job.findMany({
    where: { status: 'ACTIVE', expiresAt: { gt: now, lte: soon } },
    select: { id: true, title: true, company: { select: { userId: true } } },
  });

  if (endingSoon.length > 0) {
    await prisma.notification.createMany({
      data: endingSoon.map((job) => ({
        userId: job.company.userId,
        type: 'JOB_EXPIRING' as const,
        title: 'Offre bientot expiree',
        body: `« ${job.title} » sera retiree dans moins de 3 jours.`,
        href: `/recruteur/offres/${job.id}`,
      })),
    });
  }

  return NextResponse.json({
    ranAt: now.toISOString(),
    expiredJobs: expiredJobs.count,
    expiredSubscriptions: expiredSubscriptions.count,
    notified: endingSoon.length,
  });
}
