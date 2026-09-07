'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserCircle2,
  Briefcase,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Check,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { applyToJobAction } from '@/app/actions/applications';
import { CATEGORY_LABELS, JOB_TYPES } from '@/lib/constants';
import { cn, formatSalaryRange } from '@/lib/utils';

export interface TalentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface TalentProfile {
  headline: string;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  skills?: string[];
  portfolioUrl?: string | null;
}

export interface TalentJob {
  id: string;
  slug: string;
  title: string;
  category: string;
  jobType: string;
  city?: string | null;
  country?: string | null;
  salaryMinXof?: number | null;
  salaryMaxXof?: number | null;
  salaryPeriod?: string | null;
  description?: string | null;
  requirements?: string[];
  company?: {
    id?: string;
    name: string;
    slug?: string;
    isVerified?: boolean;
    city?: string | null;
  } | null;
}

export interface TalentApplication {
  id: string;
  jobId?: string;
  status: string;
  coverLetter?: string | null;
  recruiterNote?: string | null;
  createdAt?: Date | string | null;
  job?: {
    id?: string;
    title: string;
    slug?: string;
    company?: {
      name: string;
    } | null;
  } | null;
}

interface TalentDashboardViewProps {
  user: TalentUser;
  profile: TalentProfile;
  publishedJobs: TalentJob[];
  myApplications: TalentApplication[];
}

export function TalentDashboardView({
  user,
  profile,
  publishedJobs,
  myApplications: initialMyApplications,
}: TalentDashboardViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'published-jobs' | 'my-applications' | 'my-profile'>('published-jobs');
  const [applications, setApplications] = useState<TalentApplication[]>(initialMyApplications);

  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState('');

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Postuler à une offre publiée
  function handleApply(jobId: string) {
    setFeedback(null);
    startTransition(async () => {
      const res = await applyToJobAction({ jobId, coverLetter });
      if (res.ok) {
        setFeedback({
          type: 'success',
          message:
            "Candidature envoyée avec succès ! L'administrateur FASHLINK a reçu la notification et va analyser votre profil avant de le transmettre à la maison de production.",
        });
        const job = publishedJobs.find((j) => j.id === jobId);
        const newApp = {
          id: `app_${Date.now()}`,
          jobId,
          status: 'SUBMITTED',
          coverLetter,
          createdAt: new Date(),
          job: job || { title: 'Offre sélectionnée', company: { name: 'Maison partenaire' } },
        };
        setApplications((prev) => [newApp, ...prev]);
        setApplyingJobId(null);
        setCoverLetter('');
        setActiveTab('my-applications');
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res.error || "L'envoi de la candidature a échoué." });
      }
    });
  }

  const appliedJobIds = new Set(applications.map((a) => a.jobId || a.job?.id));

  return (
    <div id="talent-dashboard-container" className="space-y-8">
      {/* Bandeau d'explication du rôle Candidat / Talent */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-emerald-600 p-2 text-white">
              <UserCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-midnight-900">
                Espace Candidat & Talent • {user.firstName} {user.lastName}
              </h2>
              <p className="mt-1 max-w-3xl text-sm text-ink-muted">
                Consultez les annonces validées et publiées par l’administrateur. Dès que vous postulez, l’administrateur
                examine votre book et votre profil, puis transmet votre dossier qualifié à la maison de production.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              100% gratuit pour les talents
            </span>
          </div>
        </div>
      </div>

      {/* Message de confirmation / erreur */}
      {feedback && (
        <div
          className={cn(
            'flex items-center justify-between rounded-lg p-4 text-sm font-medium',
            feedback.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border border-red-200 bg-red-50 text-red-900',
          )}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs uppercase tracking-wider underline hover:opacity-80"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Navigation par onglets */}
      <div className="border-b border-line">
        <nav className="flex flex-wrap gap-2 sm:gap-6" aria-label="Onglets Talent">
          <button
            type="button"
            onClick={() => setActiveTab('published-jobs')}
            className={cn(
              'flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-semibold transition-colors',
              activeTab === 'published-jobs'
                ? 'border-emerald-600 text-emerald-900'
                : 'border-transparent text-ink-muted hover:border-line hover:text-midnight-900',
            )}
          >
            <Briefcase className="h-4 w-4" />
            <span>Offres publiées par l’admin</span>
            <span className="ml-1 rounded-full bg-canvas-warm px-2 py-0.5 text-xs text-ink-subtle">
              {publishedJobs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my-applications')}
            className={cn(
              'flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-semibold transition-colors',
              activeTab === 'my-applications'
                ? 'border-emerald-600 text-emerald-900'
                : 'border-transparent text-ink-muted hover:border-line hover:text-midnight-900',
            )}
          >
            <Send className="h-4 w-4" />
            <span>Mes candidatures & Suivi admin</span>
            <span
              className={cn(
                'ml-1 rounded-full px-2 py-0.5 text-xs font-bold',
                applications.length > 0 ? 'bg-emerald-600 text-white' : 'bg-canvas-warm text-ink-subtle',
              )}
            >
              {applications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my-profile')}
            className={cn(
              'flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-semibold transition-colors',
              activeTab === 'my-profile'
                ? 'border-emerald-600 text-emerald-900'
                : 'border-transparent text-ink-muted hover:border-line hover:text-midnight-900',
            )}
          >
            <UserCircle2 className="h-4 w-4" />
            <span>Mon Profil & Compétences</span>
          </button>
        </nav>
      </div>

      {/* CONTENU ONGLET 1 : OFFRES PUBLIÉES PAR L'ADMIN */}
      {activeTab === 'published-jobs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-midnight-900">
                Offres en ligne actuellement ouvertes aux candidatures
              </h3>
              <p className="text-sm text-ink-muted">
                Ces offres ont été validées par l&apos;administrateur FASHLINK. Cliquez sur « Postuler » pour soumettre votre profil à son analyse.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {publishedJobs.map((job) => {
              const alreadyApplied = appliedJobIds.has(job.id);
              const isApplying = applyingJobId === job.id;

              return (
                <div
                  key={job.id}
                  className="rounded-xl border border-line bg-white p-6 shadow-sm transition hover:border-emerald-300"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-900">
                          {CATEGORY_LABELS[job.category as keyof typeof CATEGORY_LABELS] || job.category}
                        </span>
                        <span className="rounded bg-canvas-warm px-2.5 py-1 text-xs text-ink-muted">
                          {JOB_TYPES[job.jobType as keyof typeof JOB_TYPES] || job.jobType}
                        </span>
                        {job.city && (
                          <span className="flex items-center gap-1 text-xs text-ink-muted">
                            <MapPin className="h-3 w-3" />
                            {job.city}, {job.country}
                          </span>
                        )}
                        <span className="text-xs text-ochre-700 font-medium">
                          Rémunération : {formatSalaryRange(job.salaryMinXof, job.salaryMaxXof, job.salaryPeriod)}
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-midnight-900">{job.title}</h4>

                      <p className="text-sm font-semibold text-emerald-800">
                        {job.company?.name || 'Maison de production'}
                        {job.company?.isVerified && (
                          <span className="ml-2 text-xs text-emerald-600 font-normal">
                            ✓ Maison vérifiée
                          </span>
                        )}
                      </p>

                      <p className="text-xs text-ink line-clamp-3 leading-relaxed whitespace-pre-line">
                        {job.description}
                      </p>

                      {job.requirements && job.requirements.length > 0 && (
                        <div className="pt-1">
                          <p className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
                            Conditions requises par la maison :
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {job.requirements.slice(0, 3).map((req: string, i: number) => (
                              <span
                                key={i}
                                className="rounded bg-canvas-warm px-2.5 py-1 text-[11px] text-ink-muted"
                              >
                                {req}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions de postulation */}
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col lg:w-52">
                      {alreadyApplied ? (
                        <span className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800">
                          <Check className="h-4 w-4" /> Candidature transmise
                        </span>
                      ) : (
                        <button
                          type="button"
                          id={`open-apply-${job.id}`}
                          onClick={() => {
                            setApplyingJobId(isApplying ? null : job.id);
                            setCoverLetter(
                              `Bonjour, modéliste d'atelier expérimentée, je souhaite mettre mes compétences au service de votre maison pour l'offre « ${job.title} ».`,
                            );
                          }}
                          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800"
                        >
                          <Send className="h-4 w-4" />
                          <span>{isApplying ? 'Annuler' : 'Postuler à cette offre'}</span>
                        </button>
                      )}

                      <Link
                        href={`/offres/${job.slug}`}
                        className="flex items-center justify-center gap-1 text-xs font-semibold text-ink-muted hover:text-midnight-900 py-1"
                      >
                        <span>Détails complets</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Formulaire de candidature rapide */}
                  {isApplying && (
                    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                      <label className="block text-xs font-bold text-emerald-950">
                        Votre message ou motivation (qui sera analysé par l&apos;administrateur) :
                      </label>
                      <textarea
                        rows={3}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Présentez vos compétences clés et votre disponibilité..."
                        className="w-full rounded-md border border-emerald-200 bg-white p-3 text-sm text-midnight-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-ink-muted">
                          Votre profil et votre CV seront joints automatiquement.
                        </span>
                        <button
                          type="button"
                          id={`confirm-apply-${job.id}`}
                          disabled={isPending}
                          onClick={() => handleApply(job.id)}
                          className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                        >
                          Confirmer l&apos;envoi
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 2 : MES CANDIDATURES ET SUIVI ADMIN */}
      {activeTab === 'my-applications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-midnight-900">
                Suivi de vos candidatures en direct
              </h3>
              <p className="text-sm text-ink-muted">
                Consultez l&apos;état de traitement par l&apos;administrateur FASHLINK et la transmission aux maisons.
              </p>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="rounded-xl border border-line bg-white p-12 text-center">
              <Send className="mx-auto h-12 w-12 text-ink-subtle" />
              <h4 className="mt-3 text-base font-bold text-midnight-900">
                Aucune candidature envoyée pour l&apos;instant
              </h4>
              <p className="mt-1 text-sm text-ink-muted">
                Parcourez les offres publiées et postulez pour démarrer le processus d&apos;analyse.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {applications.map((app) => {
                const isShortlisted = app.status === 'SHORTLISTED';

                return (
                  <div
                    key={app.id}
                    className={cn(
                      'rounded-xl border p-6 shadow-sm transition space-y-4',
                      isShortlisted
                        ? 'border-emerald-200 bg-emerald-50/25'
                        : 'border-line bg-white',
                    )}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <span className="text-xs text-ink-muted">
                          Candidature pour l&apos;offre :
                        </span>
                        <h4 className="text-base font-bold text-midnight-900">
                          {app.job?.title}
                        </h4>
                        <p className="text-xs font-semibold text-emerald-800">
                          Maison : {app.job?.company?.name || 'Maison de production'}
                        </p>
                      </div>

                      <div>
                        {isShortlisted ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Profil validé & Transmis à la maison !
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
                            <Clock className="h-3.5 w-3.5 animate-spin" />
                            En cours d&apos;analyse par l&apos;administrateur
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Retour de l'administrateur si transmis */}
                    {isShortlisted && app.recruiterNote && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-950">
                        <p className="font-bold flex items-center gap-1.5 text-emerald-900 mb-1">
                          <Sparkles className="h-4 w-4 text-emerald-600" />
                          Avis favorable de l&apos;équipe d&apos;administration FASHLINK :
                        </p>
                        <p className="italic">« {app.recruiterNote} »</p>
                      </div>
                    )}

                    {app.coverLetter && (
                      <div className="rounded-lg bg-canvas-warm p-3 text-xs text-ink">
                        <p className="font-semibold text-midnight-900 mb-0.5">Votre message :</p>
                        <p>« {app.coverLetter} »</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTENU ONGLET 3 : MON PROFIL ET COMPÉTENCES */}
      {activeTab === 'my-profile' && (
        <div className="rounded-xl border border-line bg-white p-6 md:p-8 shadow-sm space-y-6">
          <div className="border-b border-line pb-4">
            <h3 className="text-base font-bold text-midnight-900">
              Mon Profil Professionnel
            </h3>
            <p className="text-sm text-ink-muted">
              Ces éléments sont transmis à l&apos;administrateur lors de vos candidatures pour évaluer votre adéquation avec les offres des maisons.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">Nom complet :</span>
              <p className="mt-1 font-bold text-midnight-900">{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">Titre professionnel :</span>
              <p className="mt-1 font-semibold text-emerald-800">{profile.headline}</p>
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">Email :</span>
              <p className="mt-1 text-midnight-900">{user.email}</p>
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">Localisation :</span>
              <p className="mt-1 text-midnight-900">{profile.city}, {profile.country}</p>
            </div>

            <div className="sm:col-span-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">Compétences maîtrisées :</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.skills?.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-900"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">Parcours & Présentation :</span>
              <p className="mt-1 text-xs text-ink leading-relaxed">{profile.bio}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
