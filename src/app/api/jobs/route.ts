import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { PAGE_SIZE } from '@/lib/constants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const querySchema = z.object({
  q: z.string().trim().max(120).optional(),
  categorie: z.enum(['MAT', 'PRO', 'DEC', 'ACC', 'IMG', 'COM']).optional(),
  type: z.enum(['EMPLOI', 'STAGE', 'FREELANCE']).optional(),
  mode: z.enum(['SUR_SITE', 'HYBRIDE', 'DISTANCIEL']).optional(),
  niveau: z.enum(['DEBUTANT', 'JUNIOR', 'CONFIRME', 'SENIOR']).optional(),
  ville: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).default(1),
  tri: z.enum(['recent', 'salaire']).default('recent'),
});

/**
 * Liste publique des offres.
 *
 * Seules les offres ACTIVE et non expirees sortent : la moderation est le seul
 * chemin vers la visibilite publique.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parametres invalides.', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { q, categorie, type, mode, niveau, ville, page, tri } = parsed.data;

  const where: Prisma.JobWhereInput = {
    status: 'ACTIVE',
    deletedAt: null,
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    ...(categorie && {
      OR: [{ category: categorie }, { secondaryCategories: { has: categorie } }],
    }),
    ...(type && { jobType: type }),
    ...(mode && { workMode: mode }),
    ...(niveau && { experienceLevel: niveau }),
    ...(ville && { city: { contains: ville, mode: 'insensitive' } }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { company: { name: { contains: q, mode: 'insensitive' } } },
      ],
    }),
  };

  const orderBy: Prisma.JobOrderByWithRelationInput[] =
    tri === 'salaire'
      ? [{ salaryMaxXof: 'desc' }, { publishedAt: 'desc' }]
      : // Les offres a la une remontent, puis la fraicheur.
        [{ isFeatured: 'desc' }, { publishedAt: 'desc' }];

  const [total, jobs] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        secondaryCategories: true,
        jobType: true,
        workMode: true,
        experienceLevel: true,
        city: true,
        country: true,
        salaryMinXof: true,
        salaryMaxXof: true,
        salaryPeriod: true,
        showSalary: true,
        publishedAt: true,
        isFeatured: true,
        applicationCount: true,
        company: {
          select: { name: true, slug: true, logoUrl: true, isVerified: true },
        },
      },
    }),
  ]);

  return NextResponse.json(
    {
      data: jobs,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      },
    },
    {
      headers: {
        // Cache CDN court : la liste bouge peu, la bande passante est chere.
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    },
  );
}
