'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  PlusCircle,
  Clock,
  CheckCircle2,
  Users,
  Send,
  FileText,
  Star,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { createJobAction } from '@/app/actions/jobs';
import { CATEGORY_LABELS, JOB_TYPES } from '@/lib/constants';
import { cn, formatSalaryRange } from '@/lib/utils';

export interface RecruiterCompany {
  id: string;
  name: string;
  slug?: string;
  city?: string | null;
  country?: string | null;
  isVerified?: boolean;
  description?: string | null;
}

export interface RecruiterJob {
  id: string;
  slug: string;
  title: string;
  category: string;
  jobType: string;
  status: string;
  submittedAt?: Date | string | null;
  description?: string | null;
  requirements?: string[];
  missions?: string[];
  city?: string | null;
  country?: string | null;
  salaryMinXof?: number | null;
  salaryMaxXof?: number | null;
  salaryPeriod?: string | null;
  company?: RecruiterCompany | null;
}

export interface RecruiterCandidate {
  id: string;
  status: string;
  rating?: number | null;
  resumeUrlSnapshot?: string | null;
  recruiterNote?: string | null;
  coverLetter?: string | null;
  job?: {
    id: string;
    title: string;
    slug?: string;
  } | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    profile?: {
      headline?: string | null;
      skills?: string[];
      experienceLevel?: string | null;
      portfolioUrl?: string | null;
    } | null;
  } | null;
}

interface RecruiterDashboardViewProps {
  company: RecruiterCompany;
  jobs: RecruiterJob[];
  candidates: RecruiterCandidate[];
}

export function RecruiterDashboardView({
  company,
  jobs: initialJobs,
  candidates,
}: RecruiterDashboardViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'create-offer' | 'my-offers' | 'received-candidates' | 'company-profile'>('create-offer');
  const [jobs, setJobs] = useState<RecruiterJob[]>(initialJobs);

  // Formulaire d'envoi d'offre
  const [title, setTitle] = useState('Recherche 10 personnes pour atelier de confection');
  const [category, setCategory] = useState<'PRO' | 'MAT' | 'DEC' | 'ACC' | 'IMG' | 'COM'>('PRO');
  const [jobType, setJobType] = useState<'EMPLOI' | 'STAGE' | 'FREELANCE'>('EMPLOI');
  const [workMode] = useState<'SUR_SITE' | 'HYBRIDE' | 'DISTANCIEL'>('SUR_SITE');
  const [city, setCity] = useState('Cotonou');
  const [salaryMin, setSalaryMin] = useState('120000');
  const [salaryMax, setSalaryMax] = useState('180000');
  const [description, setDescription] = useState(
    'Je cherche 10 personnes qui vont travailler pour moi dans ma maison de production. Voici les conditions : expérience confirmée en confection de vêtements, maîtrise des piqueuses plates et des surjeteuses, ponctualité et disponibilité immédiate pour la production de notre nouvelle collection.',
  );
  const [requirementsInput, setRequirementsInput] = useState(
    "2 ans d'expérience en confection ou assemblage en atelier\nMaîtrise des piqueuses plates et surjeteuses industrielles\nDisponibilité immédiate pour 3 mois minimum\nPonctualité, rigueur et minutie d'assemblage",
  );
  const [missionsInput] = useState(
    "Assemblage des pièces selon fiches techniques\nMontage des cols, manches et finitions\nContrôle qualité avant repassage",
  );

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Soumission de l'offre à l'administrateur
  function handleSubmitOffer(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    const requirements = requirementsInput
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);
    const missions = missionsInput
      .split('\n')
      .map((m) => m.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await createJobAction({
        title,
        category,
        jobType,
        workMode,
        city,
        country: 'BJ',
        description,
        requirements,
        missions,
        salaryMinXof: salaryMin ? Number(salaryMin) : null,
        salaryMaxXof: salaryMax ? Number(salaryMax) : null,
        salaryPeriod: 'MOIS',
        showSalary: true,
        submit: true, // Soumettre directement à l'administrateur
      });

      if (res.ok) {
        setFeedback({
          type: 'success',
          message:
            "Votre offre a été envoyée avec succès à l'administrateur ! Il va la vérifier puis la publier pour que les candidats puissent postuler.",
        });
        const newJob = {
          id: res.data.jobId,
          slug: `offre-${Date.now()}`,
          title,
          category,
          jobType,
          status: 'PENDING_VALIDATION',
          submittedAt: new Date(),
          description,
          requirements,
          missions,
          city,
          country: 'BJ',
          salaryMinXof: Number(salaryMin),
          salaryMaxXof: Number(salaryMax),
          salaryPeriod: 'MOIS',
          company,
        };
        setJobs((prev) => [newJob, ...prev]);
        setActiveTab('my-offers');
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res.error || "L'envoi de l'offre a échoué." });
      }
    });
  }

  return (
    <div id="recruiter-dashboard-container" className="space-y-8">
      {/* Bandeau d'explication du rôle Maison */}
      <div className="rounded-xl border border-ochre-200 bg-ochre-50/50 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-ochre-600 p-2 text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-midnight-900">
                Espace Maison de Production • {company.name}
              </h2>
              <p className="mt-1 max-w-3xl text-sm text-ink-muted">
                Depuis votre compte, vous envoyez vos offres avec toutes vos conditions de travail.
                L’administrateur reçoit votre offre, la publie pour les utilisateurs, analyse ensuite les profils qui postulent,
                puis vous transmet directement les meilleurs candidats qualifiés avec son compte-rendu.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              Accès direct gratuit sans frais
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
        <nav className="flex flex-wrap gap-2 sm:gap-6" aria-label="Onglets Maison">
          <button
            type="button"
            onClick={() => setActiveTab('create-offer')}
            className={cn(
              'flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-semibold transition-colors',
              activeTab === 'create-offer'
                ? 'border-ochre-600 text-ochre-900'
                : 'border-transparent text-ink-muted hover:border-line hover:text-midnight-900',
            )}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Envoyer une offre à l’admin</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my-offers')}
            className={cn(
              'flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-semibold transition-colors',
              activeTab === 'my-offers'
                ? 'border-ochre-600 text-ochre-900'
                : 'border-transparent text-ink-muted hover:border-line hover:text-midnight-900',
            )}
          >
            <Briefcase className="h-4 w-4" />
            <span>Mes offres envoyées</span>
            <span className="ml-1 rounded-full bg-canvas-warm px-2 py-0.5 text-xs text-ink-subtle">
              {jobs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('received-candidates')}
            className={cn(
              'flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-semibold transition-colors',
              activeTab === 'received-candidates'
                ? 'border-ochre-600 text-ochre-900'
                : 'border-transparent text-ink-muted hover:border-line hover:text-midnight-900',
            )}
          >
            <Users className="h-4 w-4" />
            <span>Candidats qualifiés reçus</span>
            <span
              className={cn(
                'ml-1 rounded-full px-2 py-0.5 text-xs font-bold',
                candidates.length > 0 ? 'bg-emerald-600 text-white' : 'bg-canvas-warm text-ink-subtle',
              )}
            >
              {candidates.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('company-profile')}
            className={cn(
              'flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-semibold transition-colors',
              activeTab === 'company-profile'
                ? 'border-ochre-600 text-ochre-900'
                : 'border-transparent text-ink-muted hover:border-line hover:text-midnight-900',
            )}
          >
            <Building2 className="h-4 w-4" />
            <span>Profil de la maison</span>
          </button>
        </nav>
      </div>

      {/* CONTENU ONGLET 1 : FORMULAIRE D'ENVOI D'OFFRE */}
      {activeTab === 'create-offer' && (
        <div className="rounded-xl border border-line bg-white p-6 md:p-8 shadow-sm">
          <div className="mb-6 border-b border-line pb-4">
            <h3 className="text-lg font-bold text-midnight-900">
              Formulaire de transmission d’offre à l’administrateur
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              Indiquez le profil ou le nombre de personnes recherchées et listez vos conditions.
              L’administrateur validera et publiera votre annonce sans aucun frais.
            </p>
          </div>

          <form onSubmit={handleSubmitOffer} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-midnight-900 mb-1.5">
                  Titre de l’annonce / Besoin en personnel :
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex : Je cherche 10 personnes pour confection en atelier..."
                  className="w-full rounded-lg border border-line bg-canvas p-3 text-sm font-semibold text-midnight-900 focus:border-ochre-600 focus:outline-none focus:ring-1 focus:ring-ochre-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-midnight-900 mb-1.5">
                  Métier de la mode ciblé :
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value as 'PRO' | 'MAT' | 'DEC' | 'ACC' | 'IMG' | 'COM',
                    )
                  }
                  className="w-full rounded-lg border border-line bg-canvas p-3 text-sm text-midnight-900 focus:border-ochre-600 focus:outline-none"
                >
                  <option value="PRO">Production & Confection (Couture, Modélisme)</option>
                  <option value="MAT">Matières & Teintures (Tissage, Wax, Lin)</option>
                  <option value="DEC">Design & Stylisme (Création, Capsules)</option>
                  <option value="ACC">Accessoires & Maroquinerie (Sacs, Chaussures)</option>
                  <option value="IMG">Image & Direction Artistique (Shooting, Lookbook)</option>
                  <option value="COM">Commerce & Distribution (Boutique, Vente)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-midnight-900 mb-1.5">
                  Type de contrat :
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['EMPLOI', 'STAGE', 'FREELANCE'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setJobType(t)}
                      className={cn(
                        'rounded-lg border py-2.5 text-xs font-semibold transition',
                        jobType === t
                          ? 'border-ochre-600 bg-ochre-50 text-ochre-900'
                          : 'border-line bg-canvas text-ink-muted hover:border-midnight-300',
                      )}
                    >
                      {JOB_TYPES[t]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-midnight-900 mb-1.5">
                  Lieu de travail (Ville) :
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Cotonou, Porto-Novo, Parakou..."
                  className="w-full rounded-lg border border-line bg-canvas p-3 text-sm text-midnight-900 focus:border-ochre-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-midnight-900 mb-1.5">
                  Rémunération proposée par mois (FCFA) :
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="Min (ex: 120 000)"
                    className="w-1/2 rounded-lg border border-line bg-canvas p-3 text-sm text-midnight-900 focus:border-ochre-600 focus:outline-none"
                  />
                  <span className="text-ink-muted">-</span>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="Max (ex: 180 000)"
                    className="w-1/2 rounded-lg border border-line bg-canvas p-3 text-sm text-midnight-900 focus:border-ochre-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-midnight-900 mb-1.5">
                  Description du besoin & Conditions de travail :
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex : Je cherche 10 personnes qui vont travailler pour moi dans ma maison de production. Voici les conditions..."
                  className="w-full rounded-lg border border-line bg-canvas p-3 text-sm text-midnight-900 focus:border-ochre-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-midnight-900 mb-1.5">
                  Conditions & Exigences requises (1 condition par ligne) :
                </label>
                <textarea
                  rows={4}
                  required
                  value={requirementsInput}
                  onChange={(e) => setRequirementsInput(e.target.value)}
                  placeholder="2 ans d'expérience en confection...&#10;Maîtrise des piqueuses plates...&#10;Disponibilité immédiate..."
                  className="w-full rounded-lg border border-line bg-canvas p-3 text-sm text-midnight-900 focus:border-ochre-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-line pt-6">
              <p className="text-xs text-ink-muted">
                Aucun paiement requis. L&apos;administrateur reçoit votre offre instantanément.
              </p>
              <button
                type="submit"
                id="submit-job-to-admin"
                disabled={isPending}
                className="flex items-center justify-center gap-2 rounded-lg bg-ochre-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-ochre-800 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>Envoyer l&apos;offre à l&apos;administrateur</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CONTENU ONGLET 2 : MES OFFRES ENVOYÉES */}
      {activeTab === 'my-offers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-midnight-900">
                Suivi de vos offres et état de publication
              </h3>
              <p className="text-sm text-ink-muted">
                Consultez le statut de chaque annonce soumise à l&apos;administrateur.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('create-offer')}
              className="flex items-center gap-1.5 text-xs font-bold text-ochre-800 hover:underline"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Envoyer une nouvelle offre</span>
            </button>
          </div>

          <div className="grid gap-4">
            {jobs.map((job) => {
              const isPendingValidation = job.status === 'PENDING_VALIDATION';
              const isActive = job.status === 'ACTIVE';

              return (
                <div
                  key={job.id}
                  className="rounded-xl border border-line bg-white p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-canvas-warm px-2 py-0.5 text-xs font-bold text-midnight-900">
                          {CATEGORY_LABELS[job.category as keyof typeof CATEGORY_LABELS] || job.category}
                        </span>
                        <span className="rounded bg-canvas-warm px-2 py-0.5 text-xs text-ink-muted">
                          {JOB_TYPES[job.jobType as keyof typeof JOB_TYPES] || job.jobType}
                        </span>
                        <span className="text-xs text-ink-muted">
                          {job.city || 'Cotonou'}
                        </span>
                      </div>
                      <h4 className="mt-2 text-base font-bold text-midnight-900">{job.title}</h4>
                    </div>

                    <div>
                      {isPendingValidation ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
                          <Clock className="h-3.5 w-3.5 animate-spin" />
                          En attente de validation admin
                        </span>
                      ) : isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Publiée & Visible aux candidats
                        </span>
                      ) : (
                        <span className="rounded-full bg-canvas-warm px-3 py-1 text-xs font-medium text-ink-muted">
                          {job.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-ink line-clamp-2 leading-relaxed">{job.description}</p>

                  <div className="flex flex-wrap items-center justify-between border-t border-line pt-3 text-xs text-ink-muted">
                    <span>
                      Rémunération : {formatSalaryRange(job.salaryMinXof, job.salaryMaxXof, job.salaryPeriod)}
                    </span>
                    {isActive && (
                      <Link
                        href={`/offres/${job.slug}`}
                        className="font-bold text-ochre-800 hover:underline"
                      >
                        Consulter l&apos;annonce en ligne →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 3 : CANDIDATS QUALIFIÉS REÇUS DE L'ADMIN */}
      {activeTab === 'received-candidates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-midnight-900">
                Profils analysés & transmis par l’administrateur FASHLINK
              </h3>
              <p className="text-sm text-ink-muted">
                Ces candidats ont postulé à vos annonces. L’équipe d’administration a examiné leur profil et vous les a recommandés.
              </p>
            </div>
          </div>

          {candidates.length === 0 ? (
            <div className="rounded-xl border border-line bg-white p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-ink-subtle" />
              <h4 className="mt-3 text-base font-bold text-midnight-900">
                Aucun candidat transmis pour le moment
              </h4>
              <p className="mt-1 text-sm text-ink-muted">
                Dès qu’un talent postule et que l’administrateur valide son adéquation avec vos conditions, son dossier complet s’affiche ici.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {candidates.map((cand) => (
                <div
                  key={cand.id}
                  className="rounded-xl border border-emerald-200 bg-emerald-50/20 p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Profil qualifié transmis par FASHLINK
                      </span>
                      <h4 className="text-lg font-bold text-midnight-900">
                        {cand.user?.firstName} {cand.user?.lastName}
                      </h4>
                      <p className="text-xs text-ink-muted">
                        Pour l&apos;offre : <strong>{cand.job?.title}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {cand.rating && (
                        <div className="flex items-center gap-1 rounded bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">
                          <span>★ {cand.rating}/5</span>
                        </div>
                      )}
                      {cand.resumeUrlSnapshot && (
                        <a
                          href={cand.resumeUrlSnapshot}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:text-midnight-900"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Consulter CV / Book</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Analyse et recommandation de l'administrateur */}
                  {cand.recruiterNote && (
                    <div className="rounded-lg border border-emerald-200 bg-white p-4 text-xs text-emerald-950 shadow-xs">
                      <p className="font-bold flex items-center gap-1.5 text-emerald-900 mb-1">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        Avis & Note d&apos;analyse de l&apos;administrateur :
                      </p>
                      <p className="italic leading-relaxed">« {cand.recruiterNote} »</p>
                    </div>
                  )}

                  {/* Motivation du talent */}
                  {cand.coverLetter && (
                    <div className="rounded-lg bg-canvas-warm p-3 text-xs text-ink">
                      <p className="font-semibold text-midnight-900 mb-0.5">Message du candidat :</p>
                      <p>« {cand.coverLetter} »</p>
                    </div>
                  )}

                  {/* Coordonnées de contact */}
                  <div className="flex flex-wrap items-center justify-between border-t border-line pt-3 text-xs text-ink-muted">
                    <span>Email de contact : <strong className="text-midnight-900">{cand.user?.email}</strong></span>
                    <span>Téléphone : <strong className="text-midnight-900">{cand.user?.phone || '+229 97 00 00 03'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTENU ONGLET 4 : PROFIL DE LA MAISON */}
      {activeTab === 'company-profile' && (
        <div className="rounded-xl border border-line bg-white p-6 shadow-sm space-y-6">
          <div className="border-b border-line pb-4">
            <h3 className="text-base font-bold text-midnight-900">
              Fiche de la Maison de Production
            </h3>
            <p className="text-sm text-ink-muted">
              Informations visibles par l&apos;administrateur et associées à vos offres publiées.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">Nom de la maison :</span>
              <p className="mt-1 font-bold text-midnight-900">{company.name}</p>
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">Localisation :</span>
              <p className="mt-1 text-midnight-900">{company.city}, {company.country}</p>
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">Statut de vérification :</span>
              <p className="mt-1 text-emerald-800 font-semibold">
                {company.isVerified ? 'Maison certifiée & vérifiée par FASHLINK' : 'En cours de vérification'}
              </p>
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">Modèle tarifaire :</span>
              <p className="mt-1 text-midnight-900 font-semibold">100% sans frais ni commissions</p>
            </div>
            <div className="sm:col-span-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">Description de l&apos;atelier :</span>
              <p className="mt-1 text-ink leading-relaxed">{company.description || "Atelier et maison de confection textile."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
