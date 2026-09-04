import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { JobDetailView, type JobDetailData } from '@/components/jobs/JobDetailView';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await prisma.job
    .findFirst({
      where: { slug, status: 'ACTIVE', deletedAt: null },
      select: { title: true, description: true, company: { select: { name: true } } },
    })
    .catch(() => null);

  if (!job) return { title: 'Offre introuvable' };

  return {
    title: `${job.title} — ${job.company.name}`,
    description: job.description.slice(0, 160),
    openGraph: {
      title: `${job.title} · ${job.company.name}`,
      description: job.description.slice(0, 200),
    },
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const viewer = await getCurrentUser();

  const job = await prisma.job.findFirst({
    where: {
      slug,
      deletedAt: null,
      // Un admin ou le recruteur proprietaire peut previsualiser hors ligne.
      ...(viewer?.role === 'ADMIN' ? {} : { status: 'ACTIVE' }),
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      missions: true,
      requirements: true,
      benefits: true,
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
      durationMonths: true,
      publishedAt: true,
      expiresAt: true,
      viewCount: true,
      applicationCount: true,
      company: {
        select: {
          name: true,
          slug: true,
          logoUrl: true,
          coverUrl: true,
          description: true,
          websiteUrl: true,
          city: true,
          country: true,
          employeeCount: true,
          isVerified: true,
          categories: true,
          _count: { select: { jobs: { where: { status: 'ACTIVE' } } } },
        },
      },
    },
  });

  if (!job) notFound();

  // Compteur de vues : hors transaction et sans await bloquant le rendu.
  // Une vue perdue est sans consequence, une page lente ne l'est pas.
  void prisma.job
    .update({ where: { id: job.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => undefined);

  const hasApplied = viewer
    ? Boolean(
        await prisma.application.findUnique({
          where: { jobId_userId: { jobId: job.id, userId: viewer.id } },
          select: { id: true },
        }),
      )
    : false;

  const { company, ...rest } = job;

  const data: JobDetailData = {
    ...rest,
    company: {
      name: company.name,
      slug: company.slug,
      logoUrl: company.logoUrl,
      coverUrl: company.coverUrl,
      description: company.description,
      websiteUrl: company.websiteUrl,
      city: company.city,
      country: company.country,
      employeeCount: company.employeeCount,
      isVerified: company.isVerified,
      categories: company.categories,
      openJobsCount: company._count.jobs,
    },
  };

  return (
    <>
      <SiteHeader />
      <main>
        <JobDetailView job={data} viewerRole={viewer?.role ?? null} hasApplied={hasApplied} />
      </main>
      <SiteFooter />
    </>
  );
}
