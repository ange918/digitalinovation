'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { actionError, type ActionResult } from '@/app/actions/types';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/rbac';
import { JOB_PUBLICATION_DAYS } from '@/lib/constants';

const approveSchema = z.object({
  jobId: z.string().min(1),
  /** Duree de publication personnalisee, en jours. */
  publicationDays: z.number().int().min(7).max(180).optional(),
  /** Mise en avant accordee par l'admin (independante du quota du plan). */
  feature: z.boolean().optional(),
});

/**
 * Validation d'une offre par l'equipe FASHLINK.
 *
 * Le passage a ACTIVE est la seule voie de publication : aucune offre
 * n'apparait publiquement sans etre passee par cette action. Le compteur de
 * quota de l'abonnement est incremente ici, a la publication effective, et non
 * a la soumission — une offre rejetee ne consomme rien.
 */
export async function approveJobAction(
  input: z.infer<typeof approveSchema>,
): Promise<ActionResult<{ slug: string }>> {
  try {
    const parsed = approveSchema.parse(input);
    const admin = await requireAdmin();

    const job = await prisma.job.findFirst({
      where: { id: parsed.jobId, deletedAt: null },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        companyId: true,
        company: { select: { userId: true } },
      },
    });

    if (!job) {
      return { ok: false, error: 'Offre introuvable.' };
    }

    if (job.status !== 'PENDING_VALIDATION') {
      return {
        ok: false,
        error: `Seule une offre en attente peut etre validee (statut actuel : ${job.status}).`,
      };
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + (parsed.publicationDays ?? JOB_PUBLICATION_DAYS));

    await prisma.$transaction(async (tx) => {
      await tx.job.update({
        where: { id: job.id },
        data: {
          status: 'ACTIVE',
          reviewedById: admin.id,
          reviewedAt: now,
          rejectionReason: null,
          publishedAt: now,
          expiresAt,
          isFeatured: parsed.feature ?? false,
          featuredUntil: parsed.feature ? expiresAt : null,
        },
      });

      // Consommation du quota sur l'abonnement actif, s'il y en a un.
      await tx.subscription.updateMany({
        where: {
          companyId: job.companyId,
          status: 'ACTIVE',
          currentPeriodEnd: { gt: now },
        },
        data: {
          jobPostsUsed: { increment: 1 },
          featuredUsed: parsed.feature ? { increment: 1 } : undefined,
        },
      });

      await tx.notification.create({
        data: {
          userId: job.company.userId,
          type: 'JOB_APPROVED',
          title: 'Offre publiee',
          body: `« ${job.title} » est en ligne jusqu'au ${expiresAt.toLocaleDateString('fr-FR')}.`,
          href: `/offres/${job.slug}`,
          data: { jobId: job.id },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: admin.id,
          action: 'JOB_APPROVED',
          entityType: 'Job',
          entityId: job.id,
          metadata: { featured: parsed.feature ?? false, expiresAt: expiresAt.toISOString() },
        },
      });
    });

    revalidatePath('/admin/moderation');
    revalidatePath('/offres');
    revalidatePath(`/offres/${job.slug}`);

    return { ok: true, data: { slug: job.slug } };
  } catch (error) {
    return actionError(error, 'La validation de l’offre a échoué.');
  }
}

const rejectSchema = z.object({
  jobId: z.string().min(1),
  /**
   * Motif obligatoire : il part tel quel au recruteur, qui doit pouvoir
   * corriger sans nous ecrire.
   */
  reason: z.string().min(10, 'Le motif doit compter au moins 10 caractères.').max(2000),
});

/** Rejet d'une offre, avec motif transmis au recruteur. */
export async function rejectJobAction(
  input: z.infer<typeof rejectSchema>,
): Promise<ActionResult> {
  try {
    const parsed = rejectSchema.parse(input);
    const admin = await requireAdmin();

    const job = await prisma.job.findFirst({
      where: { id: parsed.jobId, deletedAt: null },
      select: {
        id: true,
        title: true,
        status: true,
        company: { select: { userId: true } },
      },
    });

    if (!job) {
      return { ok: false, error: 'Offre introuvable.' };
    }

    if (job.status !== 'PENDING_VALIDATION') {
      return {
        ok: false,
        error: `Seule une offre en attente peut etre rejetee (statut actuel : ${job.status}).`,
      };
    }

    const now = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.job.update({
        where: { id: job.id },
        data: {
          status: 'REJECTED',
          reviewedById: admin.id,
          reviewedAt: now,
          rejectionReason: parsed.reason,
        },
      });

      await tx.notification.create({
        data: {
          userId: job.company.userId,
          type: 'JOB_REJECTED',
          title: 'Offre a corriger',
          body: `« ${job.title} » n'a pas ete publiee : ${parsed.reason}`,
          href: `/recruteur/offres/${job.id}`,
          data: { jobId: job.id },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: admin.id,
          action: 'JOB_REJECTED',
          entityType: 'Job',
          entityId: job.id,
          metadata: { reason: parsed.reason },
        },
      });
    });

    revalidatePath('/admin/moderation');
    return { ok: true };
  } catch (error) {
    return actionError(error, 'Le rejet de l’offre a échoué.');
  }
}

const suspendSchema = z.object({
  userId: z.string().min(1),
  reason: z.string().min(10).max(2000),
});

/** Suspension d'un compte. Les offres actives du recruteur sont retirees. */
export async function suspendUserAction(
  input: z.infer<typeof suspendSchema>,
): Promise<ActionResult> {
  try {
    const parsed = suspendSchema.parse(input);
    const admin = await requireAdmin();

    if (parsed.userId === admin.id) {
      return { ok: false, error: 'Vous ne pouvez pas suspendre votre propre compte.' };
    }

    const target = await prisma.user.findUnique({
      where: { id: parsed.userId },
      select: { id: true, role: true, company: { select: { id: true } } },
    });

    if (!target) return { ok: false, error: 'Compte introuvable.' };

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: target.id },
        data: { status: 'SUSPENDED' },
      });

      // Revoque les sessions : l'exclusion est immediate.
      await tx.session.updateMany({
        where: { userId: target.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      if (target.company) {
        await tx.job.updateMany({
          where: { companyId: target.company.id, status: { in: ['ACTIVE', 'PENDING_VALIDATION'] } },
          data: { status: 'ARCHIVED' },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: admin.id,
          action: 'USER_SUSPENDED',
          entityType: 'User',
          entityId: target.id,
          metadata: { reason: parsed.reason },
        },
      });
    });

    revalidatePath('/admin/comptes');
    return { ok: true };
  } catch (error) {
    return actionError(error, 'La suspension du compte a échoué.');
  }
}

const verifySchema = z.object({ companyId: z.string().min(1), verified: z.boolean() });

/** Attribution ou retrait du badge « Entreprise verifiee ». */
export async function setCompanyVerifiedAction(
  input: z.infer<typeof verifySchema>,
): Promise<ActionResult> {
  try {
    const parsed = verifySchema.parse(input);
    const admin = await requireAdmin();

    await prisma.company.update({
      where: { id: parsed.companyId },
      data: {
        isVerified: parsed.verified,
        verifiedAt: parsed.verified ? new Date() : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: parsed.verified ? 'COMPANY_VERIFIED' : 'COMPANY_UNVERIFIED',
        entityType: 'Company',
        entityId: parsed.companyId,
      },
    });

    revalidatePath('/admin/entreprises');
    return { ok: true };
  } catch (error) {
    return actionError(error, 'La mise à jour du badge a échoué.');
  }
}
