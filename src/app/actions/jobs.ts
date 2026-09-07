'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { actionError, type ActionResult } from '@/app/actions/types';
import { prisma } from '@/lib/prisma';
import { requireRecruiter } from '@/lib/rbac';
import { shortId, slugify } from '@/lib/utils';

const CATEGORY = z.enum(['MAT', 'PRO', 'DEC', 'ACC', 'IMG', 'COM']);

const jobSchema = z
  .object({
    title: z.string().min(8, 'Le titre doit compter au moins 8 caractères.').max(160),
    description: z.string().min(120, 'Décrivez le poste en 120 caractères minimum.'),
    missions: z.array(z.string().min(3)).max(15).default([]),
    requirements: z.array(z.string().min(3)).max(15).default([]),
    benefits: z.array(z.string().min(3)).max(10).default([]),
    category: CATEGORY,
    secondaryCategories: z.array(CATEGORY).max(3).default([]),
    jobType: z.enum(['EMPLOI', 'STAGE', 'FREELANCE']),
    workMode: z.enum(['SUR_SITE', 'HYBRIDE', 'DISTANCIEL']).default('SUR_SITE'),
    experienceLevel: z.enum(['DEBUTANT', 'JUNIOR', 'CONFIRME', 'SENIOR']).default('DEBUTANT'),
    city: z.string().max(80).optional(),
    country: z.string().length(2).default('BJ'),
    salaryMinXof: z.number().int().min(0).max(100_000_000).nullable().default(null),
    salaryMaxXof: z.number().int().min(0).max(100_000_000).nullable().default(null),
    salaryPeriod: z.enum(['MOIS', 'JOUR', 'MISSION']).default('MOIS'),
    showSalary: z.boolean().default(true),
    durationMonths: z.number().int().min(1).max(36).nullable().default(null),
  })
  .refine(
    (data) =>
      data.salaryMinXof == null ||
      data.salaryMaxXof == null ||
      data.salaryMinXof <= data.salaryMaxXof,
    { message: 'Le salaire minimum ne peut pas dépasser le maximum.', path: ['salaryMinXof'] },
  )
  .refine((data) => !data.secondaryCategories.includes(data.category), {
    message: 'Une catégorie secondaire ne peut pas répéter la catégorie principale.',
    path: ['secondaryCategories'],
  });

/**
 * Creation d'une offre.
 *
 * `submit: true` envoie directement en moderation ; sinon l'offre reste en
 * brouillon. Le quota n'est verifie qu'a la soumission : un recruteur peut
 * preparer autant de brouillons qu'il veut.
 */
export async function createJobAction(
  input: z.input<typeof jobSchema> & { submit?: boolean },
): Promise<ActionResult<{ jobId: string; status: string }>> {
  try {
    const { submit = false, ...rest } = input;
    const parsed = jobSchema.parse(rest);
    const recruiter = await requireRecruiter();

    const job = await prisma.job.create({
      data: {
        ...parsed,
        city: parsed.city || null,
        companyId: recruiter.companyId,
        slug: slugify(parsed.title, shortId()),
        status: submit ? 'PENDING_VALIDATION' : 'DRAFT',
        submittedAt: submit ? new Date() : null,
      },
      select: { id: true, status: true },
    });

    revalidatePath('/recruteur/offres');
    if (submit) revalidatePath('/admin/moderation');

    return { ok: true, data: { jobId: job.id, status: job.status } };
  } catch (error) {
    return actionError(error, "La création de l’offre a échoué.");
  }
}

/**
 * Mise a jour d'une offre.
 * Modifier une offre en ligne la renvoie en moderation : le contenu publie
 * doit toujours correspondre a ce que l'equipe a valide.
 */
export async function updateJobAction(
  input: z.input<typeof jobSchema> & { jobId: string },
): Promise<ActionResult> {
  try {
    // `jobId` cible la ligne, le reste decrit les colonnes : on les separe
    // avant validation pour ne jamais l'envoyer dans le `data` de Prisma.
    const { jobId, ...payload } = input;
    const data = jobSchema.parse(payload);
    const recruiter = await requireRecruiter();

    const job = await prisma.job.findFirst({
      where: { id: jobId, companyId: recruiter.companyId, deletedAt: null },
      select: { id: true, slug: true, status: true },
    });

    if (!job) return { ok: false, error: 'Offre introuvable.' };
    if (job.status === 'CLOSED' || job.status === 'ARCHIVED') {
      return { ok: false, error: 'Une offre clôturée ne peut plus être modifiée.' };
    }

    const requiresRevalidation = job.status === 'ACTIVE' || job.status === 'REJECTED';

    await prisma.job.update({
      where: { id: job.id },
      data: {
        ...data,
        city: data.city || null,
        ...(requiresRevalidation
          ? {
              status: 'PENDING_VALIDATION',
              submittedAt: new Date(),
              publishedAt: null,
              reviewedAt: null,
              reviewedById: null,
              rejectionReason: null,
            }
          : {}),
      },
    });

    revalidatePath('/recruteur/offres');
    revalidatePath(`/offres/${job.slug}`);
    if (requiresRevalidation) revalidatePath('/admin/moderation');

    return { ok: true };
  } catch (error) {
    return actionError(error, "La mise à jour de l’offre a échoué.");
  }
}

const submitSchema = z.object({ jobId: z.string().min(1) });

/** Envoi d'un brouillon en moderation. */
export async function submitJobForReviewAction(
  input: z.infer<typeof submitSchema>,
): Promise<ActionResult> {
  try {
    const parsed = submitSchema.parse(input);
    const recruiter = await requireRecruiter();

    const job = await prisma.job.findFirst({
      where: { id: parsed.jobId, companyId: recruiter.companyId, deletedAt: null },
      select: { id: true, status: true },
    });

    if (!job) return { ok: false, error: 'Offre introuvable.' };
    if (job.status !== 'DRAFT' && job.status !== 'REJECTED') {
      return { ok: false, error: 'Seul un brouillon ou une offre rejetée peut être soumis.' };
    }

    await prisma.job.update({
      where: { id: job.id },
      data: { status: 'PENDING_VALIDATION', submittedAt: new Date(), rejectionReason: null },
    });

    revalidatePath('/recruteur/offres');
    revalidatePath('/admin/moderation');
    return { ok: true };
  } catch (error) {
    return actionError(error, 'La soumission a échoué.');
  }
}

const closeSchema = z.object({ jobId: z.string().min(1) });

/** Cloture d'une offre : elle disparait des listes et libere un emplacement. */
export async function closeJobAction(
  input: z.infer<typeof closeSchema>,
): Promise<ActionResult> {
  try {
    const parsed = closeSchema.parse(input);
    const recruiter = await requireRecruiter();

    const job = await prisma.job.findFirst({
      where: { id: parsed.jobId, companyId: recruiter.companyId, deletedAt: null },
      select: { id: true, slug: true, companyId: true },
    });

    if (!job) return { ok: false, error: 'Offre introuvable.' };

    await prisma.job.update({
      where: { id: job.id },
      data: { status: 'CLOSED', closedAt: new Date() },
    });

    revalidatePath('/recruteur/offres');
    revalidatePath(`/offres/${job.slug}`);
    return { ok: true };
  } catch (error) {
    return actionError(error, 'La clôture a échoué.');
  }
}

const saveSchema = z.object({ jobId: z.string().min(1) });

/** Bascule « offre enregistree » cote talent. */
export async function toggleSaveJobAction(
  input: z.infer<typeof saveSchema>,
): Promise<ActionResult<{ saved: boolean }>> {
  try {
    const parsed = saveSchema.parse(input);
    const { requireRole } = await import('@/lib/rbac');
    const user = await requireRole('TALENT');

    const existing = await prisma.savedJob.findUnique({
      where: { userId_jobId: { userId: user.id, jobId: parsed.jobId } },
      select: { id: true },
    });

    if (existing) {
      await prisma.savedJob.delete({ where: { id: existing.id } });
      revalidatePath('/talent/favoris');
      return { ok: true, data: { saved: false } };
    }

    await prisma.savedJob.create({ data: { userId: user.id, jobId: parsed.jobId } });
    revalidatePath('/talent/favoris');
    return { ok: true, data: { saved: true } };
  } catch (error) {
    return actionError(error, "L’enregistrement a échoué.");
  }
}
