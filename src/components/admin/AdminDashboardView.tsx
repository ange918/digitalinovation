'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  ExternalLink,
  FileText,
  MapPin,
  Check,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { approveJobAction, rejectJobAction, forwardCandidateToCompanyAction, setCompanyVerifiedAction } from '@/app/actions/moderation';
import { CATEGORY_LABELS, JOB_TYPES } from '@/lib/constants';
import { cn, formatSalaryRange } from '@/lib/utils';

export interface AdminJob {
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
  } | null;
  applicationCount?: number;
  status?: string;
}

export interface AdminApplication {
  id: string;
  status: string;
  coverLetter?: string | null;
  recruiterNote?: string | null;
  rating?: number | null;
  resumeUrlSnapshot?: string | null;
  job?: {
    id: string;
    title: string;
    company?: {
      id?: string;
      name: string;
    } | null;
  } | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profile?: {
      headline?: string | null;
      skills?: string[];
    } | null;
  } | null;
}

export interface AdminCompany {
  id: string;
  name: string;
  city?: string | null;
  country?: string | null;
  isVerified: boolean;
  description?: string | null;
  jobsCount?: number;
  _count?: { jobs?: number };
}

interface AdminDashboardViewProps {
  pendingJobs: AdminJob[];
  activeJobs: AdminJob[];
  applications: AdminApplication[];
  companies: AdminCompany[];
}

export function AdminDashboardView({
  pendingJobs: initialPendingJobs,
  activeJobs: initialActiveJobs,
  applications: initialApplications,
  companies: initialCompanies,
}: AdminDashboardViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pending-jobs' | 'candidates' | 'companies' | 'active-jobs'>('pending-jobs');
  const [pendingJobs, setPendingJobs] = useState<AdminJob[]>(initialPendingJobs);
  const [activeJobs, setActiveJobs] = useState<AdminJob[]>(initialActiveJobs);
  const [applications, setApplications] = useState<AdminApplication[]>(initialApplications);
  const [companies, setCompanies] = useState<AdminCompany[]>(initialCompanies);

  const [selectedApp, setSelectedApp] = useState<AdminApplication | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [rating, setRating] = useState(5);
  const [rejectingJobId, setRejectingJobId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 1. Publier une offre envoyée par une maison
  function handleApproveJob(jobId: string) {
    setFeedback(null);
    startTransition(async () => {
      const res = await approveJobAction({ jobId });
      if (res.ok) {
        setFeedback({
          type: 'success',
          message: "L'offre a été validée et publiée avec succès ! Elle est désormais visible pour tous les utilisateurs.",
        });
        const approved = pendingJobs.find((j) => j.id === jobId);
        if (approved) {
          setPendingJobs((prev) => prev.filter((j) => j.id !== jobId));
          setActiveJobs((prev) => [{ ...approved, status: 'ACTIVE' }, ...prev]);
        }
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erreur lors de la validation.' });
      }
    });
  }

  // 2. Rejeter une offre avec motif
  function handleRejectJob(jobId: string) {
    if (!rejectReason.trim()) {
      setFeedback({ type: 'error', message: 'Veuillez indiquer un motif de rejet constructif.' });
      return;
    }
    setFeedback(null);
    startTransition(async () => {
      const res = await rejectJobAction({ jobId, reason: rejectReason });
      if (res.ok) {
        setFeedback({
          type: 'success',
          message: "L'offre a été rejetée et le motif a été transmis à la maison de production.",
        });
        setPendingJobs((prev) => prev.filter((j) => j.id !== jobId));
        setRejectingJobId(null);
        setRejectReason('');
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erreur lors du rejet.' });
      }
    });
  }

  // 3. Analyser et transmettre un profil à la maison
  function handleForwardCandidate(applicationId: string) {
    if (!adminNote.trim()) {
      setFeedback({
        type: 'error',
        message: 'Veuillez saisir une note d’analyse ou recommandation pour la maison de production.',
      });
      return;
    }
    setFeedback(null);
    startTransition(async () => {
      const res = await forwardCandidateToCompanyAction({
        applicationId,
        adminNote,
        rating,
      });
      if (res.ok) {
        setFeedback({
          type: 'success',
          message:
            'Profil analysé avec succès et transmis à la maison de production ! Une notification a été envoyée aux deux parties.',
        });
        setApplications((prev) =>
          prev.map((a) =>
            a.id === applicationId
              ? { ...a, status: 'SHORTLISTED', recruiterNote: adminNote, rating }
              : a,
          ),
        );
        setSelectedApp(null);
        setAdminNote('');
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erreur lors de la transmission.' });
      }
    });
  }

  // 4. Vérification d'une maison
  function handleToggleVerified(companyId: string, current: boolean) {
    startTransition(async () => {
      const res = await setCompanyVerifiedAction({ companyId, verified: !current });
      if (res.ok) {
        setCompanies((prev) =>
          prev.map((c) => (c.id === companyId ? { ...c, isVerified: !current } : c)),
        );
        router.refresh();
      }
    });
  }

  const unanalyzedApps = applications.filter((a) => a.status === 'SUBMITTED');

  return (
    <div id="admin-dashboard-container" className="space-y-8">
      {/* Bandeau d'explication du rôle administrateur */}
      <div className="rounded-xl border border-royal-200 bg-royal-50/60 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-royal-600 p-2 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-midnight-900">
                Poste de Modération & Intermédiation Centrale
              </h2>
              <p className="mt-1 max-w-3xl text-sm text-ink-muted">
                En tant qu’administrateur, vous recevez les offres soumises par les maisons de production (avec leurs conditions),
                vous les publiez pour les utilisateurs, puis vous analysez chaque profil candidat avant de le transmettre à la maison.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              Système 100% sans frais
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

      {/* Onglets de gestion */}
      <div className="border-b border-line">
        <nav className="flex flex-wrap gap-2 sm:gap-6" aria-label="Onglets d'administration">
          <button
            type="button"
            onClick={() => setActiveTab('pending-jobs')}
            className={cn(
              'flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-semibold transition-colors',
              activeTab === 'pending-jobs'
                ? 'border-royal-600 text-royal-900'
                : 'border-transparent text-ink-muted hover:border-line hover:text-midnight-900',
            )}
          >
            <Clock className="h-4 w-4" />
            <span>Offres des maisons à publier</span>
            <span
              className={cn(
                'ml-1 rounded-full px-2 py-0.5 text-xs',
                pendingJobs.length > 0
                  ? 'bg-royal-600 text-white font-bold'
                  : 'bg-canvas-warm text-ink-subtle',
              )}
            >
              {pendingJobs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('candidates')}
            className={cn(
              'flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-semibold transition-colors',
              activeTab === 'candidates'
                ? 'border-royal-600 text-royal-900'
                : 'border-transparent text-ink-muted hover:border-line hover:text-midnight-900',
            )}
          >
            <Users className="h-4 w-4" />
            <span>Candidats reçus à analyser</span>
            <span
              className={cn(
                'ml-1 rounded-full px-2 py-0.5 text-xs',
                unanalyzedApps.length > 0
                  ? 'bg-ochre-500 text-white font-bold animate-pulse'
                  : 'bg-canvas-warm text-ink-subtle',
              )}
            >
              {unanalyzedApps.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('companies')}
            className={cn(
              'flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-semibold transition-colors',
              activeTab === 'companies'
                ? 'border-royal-600 text-royal-900'
                : 'border-transparent text-ink-muted hover:border-line hover:text-midnight-900',
            )}
          >
            <Building2 className="h-4 w-4" />
            <span>Maisons de production</span>
            <span className="ml-1 rounded-full bg-canvas-warm px-2 py-0.5 text-xs text-ink-subtle">
              {companies.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('active-jobs')}
            className={cn(
              'flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-semibold transition-colors',
              activeTab === 'active-jobs'
                ? 'border-royal-600 text-royal-900'
                : 'border-transparent text-ink-muted hover:border-line hover:text-midnight-900',
            )}
          >
            <Briefcase className="h-4 w-4" />
            <span>Offres actuellement en ligne</span>
            <span className="ml-1 rounded-full bg-canvas-warm px-2 py-0.5 text-xs text-ink-subtle">
              {activeJobs.length}
            </span>
          </button>
        </nav>
      </div>

      {/* CONTENU ONGLET 1 : OFFRES EN ATTENTE DE PUBLICATION */}
      {activeTab === 'pending-jobs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-midnight-900">
                Offres envoyées par les maisons de production
              </h3>
              <p className="text-sm text-ink-muted">
                Analysez les conditions définies par la maison, puis validez pour que l&apos;annonce apparaisse aux utilisateurs.
              </p>
            </div>
          </div>

          {pendingJobs.length === 0 ? (
            <div className="rounded-xl border border-line bg-white p-12 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <h4 className="mt-3 text-base font-bold text-midnight-900">
                Toutes les offres ont été modérées
              </h4>
              <p className="mt-1 text-sm text-ink-muted">
                Aucune nouvelle offre de maison de production n&apos;est actuellement en attente.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {pendingJobs.map((job) => (
                <div
                  key={job.id}
                  className="overflow-hidden rounded-xl border border-line bg-white p-6 shadow-sm transition hover:border-royal-300"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-royal-100 px-2.5 py-1 text-xs font-bold text-royal-900">
                          {CATEGORY_LABELS[job.category as keyof typeof CATEGORY_LABELS] || job.category}
                        </span>
                        <span className="rounded-md bg-canvas-warm px-2.5 py-1 text-xs font-medium text-ink-muted">
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

                      <p className="text-sm font-medium text-royal-700">
                        Maison de production : {job.company?.name || 'Maison partenaire'}
                        {job.company?.isVerified && (
                          <span className="ml-2 inline-flex items-center gap-0.5 text-xs text-emerald-700 font-semibold">
                            <ShieldCheck className="h-3.5 w-3.5" /> Maison vérifiée
                          </span>
                        )}
                      </p>

                      <div className="rounded-lg bg-canvas-warm/80 p-4 text-sm text-ink leading-relaxed">
                        <p className="font-semibold text-midnight-900 mb-1">
                          Description & Conditions envoyées par la maison :
                        </p>
                        <p className="whitespace-pre-line">{job.description}</p>
                      </div>

                      {job.requirements && job.requirements.length > 0 && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                            Conditions & Exigences requises :
                          </p>
                          <ul className="grid gap-1 sm:grid-cols-2">
                            {job.requirements.map((req: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-ink">
                                <span className="text-royal-600 font-bold">•</span>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Actions de l'administrateur */}
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col lg:w-56">
                      <button
                        type="button"
                        id={`approve-job-${job.id}`}
                        disabled={isPending}
                        onClick={() => handleApproveJob(job.id)}
                        className="flex items-center justify-center gap-2 rounded-lg bg-royal-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-royal-700 disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                        <span>Publier pour les utilisateurs</span>
                      </button>

                      <button
                        type="button"
                        id={`open-reject-job-${job.id}`}
                        disabled={isPending}
                        onClick={() => setRejectingJobId(rejectingJobId === job.id ? null : job.id)}
                        className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Rejeter avec motif</span>
                      </button>
                    </div>
                  </div>

                  {/* Formulaire de motif de rejet */}
                  {rejectingJobId === job.id && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50/50 p-4">
                      <label className="block text-xs font-bold text-red-900 mb-1">
                        Motif transmis à la maison de production :
                      </label>
                      <textarea
                        rows={2}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Ex : Veuillez préciser la rémunération minimale ou le nombre d'heures par semaine..."
                        className="w-full rounded-md border border-red-200 bg-white p-2.5 text-sm text-midnight-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <div className="mt-2 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setRejectingJobId(null)}
                          className="px-3 py-1.5 text-xs text-ink-muted hover:text-midnight-900"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          id={`confirm-reject-job-${job.id}`}
                          onClick={() => handleRejectJob(job.id)}
                          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                        >
                          Confirmer le rejet
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTENU ONGLET 2 : CANDIDATS REÇUS À ANALYSER */}
      {activeTab === 'candidates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-midnight-900">
                Profils des candidats à analyser & transmettre
              </h3>
              <p className="text-sm text-ink-muted">
                Les utilisateurs ont postulé aux annonces publiées. Analysez leur profil et transmettez-le à la maison de production avec votre évaluation.
              </p>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="rounded-xl border border-line bg-white p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-ink-subtle" />
              <h4 className="mt-3 text-base font-bold text-midnight-900">
                Aucune candidature enregistrée pour l&apos;instant
              </h4>
              <p className="mt-1 text-sm text-ink-muted">
                Dès qu’un talent clique sur « Postuler », son dossier arrive directement dans cette file d’analyse.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {applications.map((app) => {
                const isShortlisted = app.status === 'SHORTLISTED';
                const isAnalyzing = selectedApp?.id === app.id;

                return (
                  <div
                    key={app.id}
                    className={cn(
                      'rounded-xl border p-6 shadow-sm transition',
                      isShortlisted
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-line bg-white hover:border-royal-300',
                    )}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-1 text-xs font-bold',
                              isShortlisted
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-ochre-100 text-ochre-900 animate-pulse',
                            )}
                          >
                            {isShortlisted
                              ? 'Transmis à la maison de production'
                              : 'À analyser par l’admin'}
                          </span>

                          <span className="text-xs text-ink-muted">
                            Postule pour :{' '}
                            <strong className="text-midnight-900">{app.job?.title}</strong> chez{' '}
                            <span className="font-semibold text-royal-700">
                              {app.job?.company?.name}
                            </span>
                          </span>
                        </div>

                        {/* Identité du talent */}
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-royal-100 text-sm font-bold text-royal-900">
                            {app.user?.firstName?.[0]}
                            {app.user?.lastName?.[0]}
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-midnight-900">
                              {app.user?.firstName} {app.user?.lastName}
                            </h4>
                            <p className="text-xs text-ink-muted">
                              {app.user?.email} • {app.user?.profile?.headline || 'Talent de la mode'}
                            </p>
                          </div>
                        </div>

                        {/* Lettre / motivation */}
                        {app.coverLetter && (
                          <div className="rounded-lg bg-canvas-warm p-3 text-xs text-ink">
                            <p className="font-semibold text-midnight-900 mb-1">
                              Message du candidat :
                            </p>
                            <p className="italic">« {app.coverLetter} »</p>
                          </div>
                        )}

                        {/* Compétences du profil */}
                        {app.user?.profile?.skills && (
                          <div className="flex flex-wrap gap-1.5">
                            {app.user.profile.skills.map((skill: string, i: number) => (
                              <span
                                key={i}
                                className="rounded bg-canvas-warm px-2 py-0.5 text-[11px] text-ink-muted"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Si déjà transmis */}
                        {isShortlisted && (
                          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                            <p className="font-bold flex items-center gap-1.5 mb-1">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              Note d’analyse envoyée à {app.job?.company?.name} :
                            </p>
                            <p>« {app.recruiterNote} »</p>
                          </div>
                        )}
                      </div>

                      {/* Actions Admin */}
                      <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col lg:w-56">
                        {!isShortlisted ? (
                          <button
                            type="button"
                            id={`analyze-candidate-${app.id}`}
                            onClick={() => {
                              setSelectedApp(isAnalyzing ? null : app);
                              setAdminNote(
                                `Profil analysé et vérifié. Excellente maîtrise technique, candidat(e) vivement recommandé(e) pour votre annonce « ${app.job?.title} ».`,
                              );
                            }}
                            className="flex items-center justify-center gap-2 rounded-lg bg-royal-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-royal-700"
                          >
                            <Send className="h-4 w-4" />
                            <span>{isAnalyzing ? 'Fermer l’analyse' : 'Analyser & Transmettre'}</span>
                          </button>
                        ) : (
                          <span className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
                            <Check className="h-4 w-4" /> Dossier transmis
                          </span>
                        )}

                        {app.resumeUrlSnapshot && (
                          <a
                            href={app.resumeUrlSnapshot}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-ink-muted hover:text-midnight-900"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Voir le CV / Book</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Panneau de rédaction de l'analyse */}
                    {isAnalyzing && (
                      <div className="mt-4 rounded-lg border border-royal-200 bg-royal-50/50 p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-royal-900">
                            Analyse de qualification pour la maison {app.job?.company?.name} :
                          </h5>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-ink-muted mr-1">Évaluation :</span>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={cn(
                                  'p-0.5 text-sm',
                                  star <= rating ? 'text-amber-500' : 'text-line',
                                )}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>

                        <textarea
                          rows={3}
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          placeholder="Rédigez votre retour à la maison : niveau d'expérience, maîtrise des machines, disponibilité..."
                          className="w-full rounded-md border border-royal-200 bg-white p-3 text-sm text-midnight-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                        />

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-ink-muted">
                            Le profil et votre avis seront instantanément consultables par la maison de production.
                          </span>
                          <button
                            type="button"
                            id={`forward-candidate-submit-${app.id}`}
                            disabled={isPending}
                            onClick={() => handleForwardCandidate(app.id)}
                            className="flex items-center gap-2 rounded-lg bg-royal-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-royal-800 disabled:opacity-50"
                          >
                            <Send className="h-3.5 w-3.5" />
                            <span>Envoyer à la maison de production</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTENU ONGLET 3 : MAISONS DE PRODUCTION */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-midnight-900">
                Maisons de production et ateliers inscrits
              </h3>
              <p className="text-sm text-ink-muted">
                Consultez l&apos;ensemble des maisons émettrices d&apos;offres et gérez leur badge de vérification.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <div
                key={company.id}
                className="rounded-xl border border-line bg-white p-5 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-midnight-900">{company.name}</h4>
                    <p className="text-xs text-ink-muted">
                      {company.city}, {company.country}
                    </p>
                  </div>
                  {company.isVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                      <ShieldCheck className="h-3 w-3" /> Vérifiée
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-canvas-warm px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                      Standard
                    </span>
                  )}
                </div>

                <p className="text-xs text-ink line-clamp-3 leading-relaxed">
                  {company.description || "Atelier et maison de production textile dans l'écosystème mode béninois."}
                </p>

                <div className="flex items-center justify-between border-t border-line pt-3 text-xs">
                  <span className="text-ink-muted font-medium">
                    {company.jobsCount || company._count?.jobs || 0} offre(s)
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleVerified(company.id, company.isVerified)}
                    className="font-semibold text-royal-700 hover:text-royal-900 underline"
                  >
                    {company.isVerified ? 'Retirer badge' : 'Accorder badge vérifié'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 4 : TOUTES LES OFFRES ACTIVES */}
      {activeTab === 'active-jobs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-midnight-900">
                Offres actuellement publiées et visibles
              </h3>
              <p className="text-sm text-ink-muted">
                Ces offres ont été validées par l&apos;administrateur et sont consultables par les talents.
              </p>
            </div>
            <Link
              href="/offres"
              className="flex items-center gap-1.5 text-xs font-bold text-royal-700 hover:underline"
            >
              <span>Voir la page publique des offres</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-line rounded-xl border border-line bg-white shadow-sm overflow-hidden">
            {activeJobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-canvas-warm/30 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-royal-50 px-2 py-0.5 text-xs font-bold text-royal-800">
                      {CATEGORY_LABELS[job.category as keyof typeof CATEGORY_LABELS] || job.category}
                    </span>
                    <h4 className="font-bold text-midnight-900">{job.title}</h4>
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    Publiée pour <strong>{job.company?.name}</strong> • {job.city || 'Bénin'} •{' '}
                    {job.applicationCount || 0} candidature(s) reçue(s)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    En ligne
                  </span>
                  <Link
                    href={`/offres/${job.slug}`}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-muted hover:text-midnight-900"
                  >
                    Voir l’annonce
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
