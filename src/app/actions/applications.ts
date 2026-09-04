'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { actionError, type ActionResult } from '@/app/actions/types';
import { prisma } from '@/lib/prisma';
import { requireRole, requireUser } from '@/lib/rbac';
import { APPLICATION_TRANSITIONS, APPLICATION_STATUSES } from '@/lib/constants';

const applySchema = z.object({
  jobId: z.string().min(1),
  coverLetter: z.string().max(4000).optional(),
});

/**
 * Candidature en un clic.
 *
 * Tout se fait en une transaction : creation de la candidature, incrementation
 * du compteur de l'offre, evenement de timeline et notification au recruteur.
 * L'unicite (jobId, userId) empeche le double envoi, y compris si le talent
 * clique deux fois avant que l'interface ne se mette a jour.
 */
export async function applyToJobAction(
  input: z.infer<typeof applySchema>,
): Promise<ActionResult> {
  try {
    const parsed = applySchema.parse(input);
    const user = await requireRole('TALENT');

    const job = await prisma.job.findFirst({
      where: { id: parsed.jobId, status: 'ACTIVE', deletedAt: null },
      select: {
        id: true,
        slug: true,
        title: true,
        expiresAt: true,
        company: { select: { userId: true, name: true } },
      },
    });

    if (!job) {
      return { ok: false, error: "Cette offre n'est plus disponible." };
    }

    if (job.expiresAt && job.expiresAt.getTime() < Date.now()) {
      return { ok: false, error: 'Les candidatures pour cette offre sont closes.' };
    }

    const existing = await prisma.application.findUnique({
      where: { jobId_userId: { jobId: job.id, userId: user.id } },
      select: { id: true },
    });

    if (existing) {
      return { ok: false, error: 'Vous avez deja postule a cette offre.' };
    }

    // Le CV est fige au moment de l'envoi : le talent peut le mettre a jour
    // ensuite sans modifier les dossiers deja transmis.
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { resumeUrl: true },
    });

    await prisma.$transaction(async (tx) => {
      const application = await tx.application.create({
        data: {
          jobId: job.id,
          userId: user.id,
          status: 'SUBMITTED',
          coverLetter: parsed.coverLetter,
          resumeUrlSnapshot: profile?.resumeUrl ?? null,
        },
      });

      await tx.applicationEvent.create({
        data: {
          applicationId: application.id,
          fromStatus: null,
          toStatus: 'SUBMITTED',
          actorId: user.id,
        },
      });

      await tx.job.update({
        where: { id: job.id },
        data: { applicationCount: { increment: 1 } },
      });

      await tx.notification.create({
        data: {
          userId: job.company.userId,
          type: 'APPLICATION_RECEIVED',
          title: 'Nouvelle candidature',
          body: `${user.firstName} ${user.lastName} a postule a « ${job.title} ».`,
          href: `/recruteur/offres/${job.id}/candidatures`,
          data: { applicationId: application.id, jobId: job.id },
        },
      });
    });

    revalidatePath(`/offres/${job.slug}`);
    revalidatePath('/talent/candidatures');

    return { ok: true };
  } catch (error) {
    return actionError(error, "L'envoi de la candidature a echoue.");
  }
}

const withdrawSchema = z.object({ applicationId: z.string().min(1) });

/** Retrait d'une candidature par le talent. */
export async function withdrawApplicationAction(
  input: z.infer<typeof withdrawSchema>,
): Promise<ActionResult> {
  try {
    const parsed = withdrawSchema.parse(input);
    const user = await requireRole('TALENT');

    const application = await prisma.application.findFirst({
      where: { id: parsed.applicationId, userId: user.id },
      select: { id: true, status: true, jobId: true },
    });

    if (!application) {
      return { ok: false, error: 'Candidature introuvable.' };
    }

    if (!APPLICATION_TRANSITIONS[application.status].includes('WITHDRAWN')) {
      return {
        ok: false,
        error: `Une candidature « ${APPLICATION_STATUSES[application.status].label} » ne peut plus etre retiree.`,
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.application.update({
        where: { id: application.id },
        data: { status: 'WITHDRAWN', decidedAt: new Date() },
      });

      await tx.applicationEvent.create({
        data: {
          applicationId: application.id,
          fromStatus: application.status,
          toStatus: 'WITHDRAWN',
          actorId: user.id,
        },
      });

      await tx.job.update({
        where: { id: application.jobId },
        data: { applicationCount: { decrement: 1 } },
      });
    });

    revalidatePath('/talent/candidatures');
    return { ok: true };
  } catch (error) {
    return actionError(error, 'Le retrait de la candidature a echoue.');
  }
}

const updateStatusSchema = z.object({
  applicationId: z.string().min(1),
  status: z.enum([
    'VIEWED',
    'SHORTLISTED',
    'INTERVIEW',
    'OFFER',
    'HIRED',
    'REJECTED',
  ]),
  comment: z.string().max(2000).optional(),
});

/**
 * Avancement d'une candidature par le recruteur.
 * Les transitions illegales (ex. SUBMITTED -> HIRED) sont refusees.
 */
export async function updateApplicationStatusAction(
  input: z.infer<typeof updateStatusSchema>,
): Promise<ActionResult> {
  try {
    const parsed = updateStatusSchema.parse(input);
    const user = await requireUser();

    const application = await prisma.application.findUnique({
      where: { id: parsed.applicationId },
      select: {
        id: true,
        status: true,
        userId: true,
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            company: { select: { userId: true } },
          },
        },
      },
    });

    if (!application) {
      return { ok: false, error: 'Candidature introuvable.' };
    }

    const isOwner = application.job.company.userId === user.id;
    if (!isOwner && user.role !== 'ADMIN') {
      return { ok: false, error: 'Vous ne gerez pas cette offre.' };
    }

    if (!APPLICATION_TRANSITIONS[application.status].includes(parsed.status)) {
      return {
        ok: false,
        error: `Transition impossible : « ${APPLICATION_STATUSES[application.status].label} » vers « ${APPLICATION_STATUSES[parsed.status].label} ».`,
      };
    }

    const isFinal = parsed.status === 'HIRED' || parsed.status === 'REJECTED';

    await prisma.$transaction(async (tx) => {
      await tx.application.update({
        where: { id: application.id },
        data: {
          status: parsed.status,
          viewedAt: parsed.status === 'VIEWED' ? new Date() : undefined,
          decidedAt: isFinal ? new Date() : undefined,
        },
      });

      await tx.applicationEvent.create({
        data: {
          applicationId: application.id,
          fromStatus: application.status,
          toStatus: parsed.status,
          actorId: user.id,
          comment: parsed.comment,
        },
      });

      // On ne notifie pas la simple consultation : le talent n'a pas besoin de
      // savoir a la seconde ou son dossier est ouvert.
      if (parsed.status !== 'VIEWED') {
        await tx.notification.create({
          data: {
            userId: application.userId,
            type: 'APPLICATION_STATUS_CHANGED',
            title: `Candidature ${APPLICATION_STATUSES[parsed.status].label.toLowerCase()}`,
            body: `Votre candidature a « ${application.job.title} » a evolue.`,
            href: '/talent/candidatures',
            data: { applicationId: application.id, status: parsed.status },
          },
        });
      }
    });

    revalidatePath(`/recruteur/offres/${application.job.id}/candidatures`);
    return { ok: true };
  } catch (error) {
    return actionError(error, 'La mise a jour de la candidature a echoue.');
  }
}
