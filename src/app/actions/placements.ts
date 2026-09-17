'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { actionError, type ActionResult } from '@/app/actions/types';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/rbac';

/**
 * Entree telle que l'interface l'envoie : des chaines issues de champs `date`
 * et `number`. `z.input` ne convient pas ici — `z.coerce` fait coincider
 * entree et sortie dans les types zod, et decrirait donc deja des `Date`.
 */
export interface CreatePlacementInput {
  applicationId: string;
  startsAt: string;
  endsAt?: string | null;
  monthlyFeeXof?: number | null;
  monthlyPayXof?: number | null;
  adminNote?: string;
}

const createPlacementSchema = z
  .object({
    applicationId: z.string().min(1),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date().optional().nullable(),
    /** Montant mensuel facture a la maison, en XOF. */
    monthlyFeeXof: z.coerce.number().int().positive().optional().nullable(),
    /** Montant mensuel reverse au talent, en XOF. */
    monthlyPayXof: z.coerce.number().int().positive().optional().nullable(),
    adminNote: z.string().max(2000).optional(),
  })
  .refine((v) => !v.endsAt || v.endsAt > v.startsAt, {
    message: 'La fin de mission doit être postérieure à son début.',
    path: ['endsAt'],
  })
  .refine(
    (v) => !v.monthlyFeeXof || !v.monthlyPayXof || v.monthlyPayXof <= v.monthlyFeeXof,
    {
      // FASHLINK encaisse la maison puis reverse au talent : reverser plus que
      // ce qui est facture est toujours une faute de saisie.
      message:
        'Le montant reversé au talent ne peut pas dépasser celui facturé à la maison.',
      path: ['monthlyPayXof'],
    },
  );

/**
 * Placement d'un talent chez une maison.
 *
 * C'est l'acte final de la chaine FASHLINK : la maison a exprime un besoin,
 * l'administrateur a publie la demande, le talent a postule, son profil a ete
 * transmis — il est maintenant place. Le compteur `filledCount` de la demande
 * avance d'un cran ; sur une demande de six postes, le board affiche des lors
 * « 1 / 6 pourvus ».
 *
 * Tout est fait dans une seule transaction : un placement enregistre sans que
 * `filledCount` suive laisserait le board proposer un poste deja pourvu.
 */
export async function createPlacementAction(
  input: CreatePlacementInput,
): Promise<ActionResult<{ placementId: string }>> {
  try {
    const parsed = createPlacementSchema.parse(input);
    const admin = await requireAdmin();

    const application = await prisma.application.findUnique({
      where: { id: parsed.applicationId },
      select: {
        id: true,
        status: true,
        userId: true,
        placement: { select: { id: true } },
        user: { select: { firstName: true, lastName: true } },
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            headcount: true,
            filledCount: true,
            company: { select: { name: true, userId: true } },
          },
        },
      },
    });

    if (!application) {
      return { ok: false, error: 'Candidature introuvable.' };
    }

    if (application.placement) {
      return { ok: false, error: 'Ce talent est déjà placé sur cette demande.' };
    }

    if (application.status === 'WITHDRAWN') {
      return {
        ok: false,
        error: 'Le talent a retiré sa candidature : il ne peut pas être placé.',
      };
    }

    const { job } = application;

    // Garde metier : une maison qui a demande six personnes en recoit six.
    if (job.filledCount >= job.headcount) {
      return {
        ok: false,
        error: `Les ${job.headcount} poste(s) de « ${job.title} » sont déjà pourvus.`,
      };
    }

    const talentName = `${application.user.firstName} ${application.user.lastName}`;
    const placementId = await prisma.$transaction(async (tx) => {
      const placement = await tx.placement.create({
        data: {
          jobId: job.id,
          userId: application.userId,
          applicationId: application.id,
          status: 'ACCEPTED',
          startsAt: parsed.startsAt,
          endsAt: parsed.endsAt ?? null,
          monthlyFeeXof: parsed.monthlyFeeXof ?? null,
          monthlyPayXof: parsed.monthlyPayXof ?? null,
          adminNote: parsed.adminNote ?? null,
        },
      });

      await tx.application.update({
        where: { id: application.id },
        data: { status: 'HIRED', decidedAt: new Date() },
      });

      // `increment` plutot qu'une ecriture de la valeur lue : deux placements
      // enregistres en meme temps ne doivent pas s'ecraser l'un l'autre.
      await tx.job.update({
        where: { id: job.id },
        data: { filledCount: { increment: 1 } },
      });

      await tx.applicationEvent.create({
        data: {
          applicationId: application.id,
          fromStatus: application.status,
          toStatus: 'HIRED',
          actorId: admin.id,
          comment: `Placement chez ${job.company.name} à partir du ${parsed.startsAt.toLocaleDateString('fr-FR')}.`,
        },
      });

      await tx.notification.create({
        data: {
          userId: application.userId,
          type: 'PLACEMENT_CREATED',
          title: 'Vous êtes placé·e',
          body: `FASHLINK vous place chez ${job.company.name} pour « ${job.title} », à partir du ${parsed.startsAt.toLocaleDateString('fr-FR')}.`,
          href: '/talent#candidatures',
          data: { placementId: placement.id, jobId: job.id },
        },
      });

      await tx.notification.create({
        data: {
          userId: job.company.userId,
          type: 'PLACEMENT_CREATED',
          title: 'Un talent vous est affecté',
          body: `${talentName} rejoint votre équipe pour « ${job.title} » à partir du ${parsed.startsAt.toLocaleDateString('fr-FR')}. ${job.filledCount + 1} poste(s) pourvu(s) sur ${job.headcount}.`,
          href: '/recruteur#candidats',
          data: { placementId: placement.id, jobId: job.id },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: admin.id,
          action: 'PLACEMENT_CREATED',
          entityType: 'Placement',
          entityId: placement.id,
          metadata: {
            jobId: job.id,
            userId: application.userId,
            monthlyFeeXof: parsed.monthlyFeeXof ?? null,
            monthlyPayXof: parsed.monthlyPayXof ?? null,
          },
        },
      });

      return placement.id;
    });

    revalidatePath('/admin');
    revalidatePath('/recruteur');
    revalidatePath('/talent');

    return { ok: true, data: { placementId } };
  } catch (error) {
    return actionError(error, 'L’enregistrement du placement a échoué.');
  }
}

export interface EndPlacementInput {
  placementId: string;
  endedAt?: string;
}

const endPlacementSchema = z.object({
  placementId: z.string().min(1),
  endedAt: z.coerce.date().optional(),
});

/**
 * Fin de mission. Le poste redevient disponible sur la demande : une maison
 * dont un ouvrier s'en va doit pouvoir etre repourvue sans redeposer sa
 * demande.
 */
export async function endPlacementAction(
  input: EndPlacementInput,
): Promise<ActionResult> {
  try {
    const parsed = endPlacementSchema.parse(input);
    const admin = await requireAdmin();

    const placement = await prisma.placement.findUnique({
      where: { id: parsed.placementId },
      select: { id: true, status: true, jobId: true },
    });

    if (!placement) {
      return { ok: false, error: 'Placement introuvable.' };
    }

    if (placement.status === 'ENDED' || placement.status === 'CANCELLED') {
      return { ok: false, error: 'Ce placement est déjà clos.' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.placement.update({
        where: { id: placement.id },
        data: { status: 'ENDED', endsAt: parsed.endedAt ?? new Date() },
      });

      await tx.job.update({
        where: { id: placement.jobId },
        data: { filledCount: { decrement: 1 } },
      });

      await tx.auditLog.create({
        data: {
          actorId: admin.id,
          action: 'PLACEMENT_ENDED',
          entityType: 'Placement',
          entityId: placement.id,
        },
      });
    });

    revalidatePath('/admin');
    revalidatePath('/recruteur');

    return { ok: true };
  } catch (error) {
    return actionError(error, 'La clôture du placement a échoué.');
  }
}
