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

      // Notification à la maison de production
      await tx.notification.create({
        data: {
          userId: job.company.userId,
          type: 'JOB_APPROVED',
          title: 'Offre validée et publiée',
          body: `« ${job.title} » a été validée par l'administrateur et est maintenant en ligne pour les candidats jusqu'au ${expiresAt.toLocaleDateString('fr-FR')}.`,
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

    revalidatePath('/admin');
    revalidatePath('/admin/moderation');
    revalidatePath('/recruteur');
    revalidatePath('/talent');
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

const forwardCandidateSchema = z.object({
  applicationId: z.string().min(1),
  adminNote: z.string().min(3, 'Veuillez saisir une analyse ou recommandation pour la maison.'),
  rating: z.number().int().min(1).max(5).optional(),
});

/**
 * Analyse & transmission d'un profil candidat à la maison de production.
 *
 * Rôle central de l'administrateur FASHLINK : après analyse du book,
 * du CV et de l'adéquation avec les conditions formulées par la maison,
 * l'administrateur valide le profil et le transmet directement à l'espace
 * de la maison avec ses commentaires qualifiés.
 */
export async function forwardCandidateToCompanyAction(
  input: z.infer<typeof forwardCandidateSchema>,
): Promise<ActionResult<{ applicationId: string }>> {
  try {
    const parsed = forwardCandidateSchema.parse(input);
    const admin = await requireAdmin();

    const app = await prisma.application.findFirst({
      where: { id: parsed.applicationId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            companyId: true,
            company: { select: { userId: true, name: true } },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!app) {
      return { ok: false, error: 'Candidature introuvable.' };
    }

    const now = new Date();
    await prisma.$transaction(async (tx) => {
      await tx.application.update({
        where: { id: app.id },
        data: {
          status: 'SHORTLISTED',
          recruiterNote: parsed.adminNote,
          rating: parsed.rating ?? 5,
          viewedAt: app.viewedAt ?? now,
        },
      });

      await tx.applicationEvent.create({
        data: {
          applicationId: app.id,
          fromStatus: app.status,
          toStatus: 'SHORTLISTED',
          actorId: admin.id,
          comment: `Profil analysé et transmis à la maison : ${parsed.adminNote}`,
        },
      });

      // Notification pour la maison de production
      if (app.job?.company?.userId) {
        await tx.notification.create({
          data: {
            userId: app.job.company.userId,
            type: 'APPLICATION_SHORTLISTED',
            title: 'Profil analysé & transmis par FASHLINK',
            body: `L'administrateur vous a transmis le profil de ${app.user.firstName} ${app.user.lastName} pour votre annonce « ${app.job.title} ». Analyse admin : « ${parsed.adminNote} ».`,
            href: `/recruteur#candidats`,
            data: { applicationId: app.id, jobId: app.job.id },
          },
        });
      }

      // Notification pour le candidat
      await tx.notification.create({
        data: {
          userId: app.user.id,
          type: 'APPLICATION_STATUS_CHANGED',
          title: 'Profil validé et transmis à la maison !',
          body: `Votre profil a été analysé et validé par l'équipe FASHLINK, puis transmis à la maison ${app.job?.company?.name || 'de production'}.`,
          href: `/talent#candidatures`,
          data: { applicationId: app.id, jobId: app.job.id },
        },
      });
    });

    revalidatePath('/admin');
    revalidatePath('/admin/moderation');
    revalidatePath('/recruteur');
    revalidatePath('/talent');

    return { ok: true, data: { applicationId: app.id } };
  } catch (error) {
    return actionError(error, 'La transmission du profil a échoué.');
  }
}

