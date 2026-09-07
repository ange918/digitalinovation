import { Section } from '@/components/landing/Section';
import { ButtonLink } from '@/components/ui/Button';
import {
  ArrowRightIcon,
  BuildingIcon,
  CheckIcon,
  ShieldCheckIcon,
  UsersIcon,
} from '@/components/ui/Icons';

export function ThreeInterfacesSection() {
  return (
    <Section
      id="interfaces"
      tone="warm"
      eyebrow="Architecture & Workflow"
      title="Trois interfaces dédiées pour un recrutement fluide"
      intro="FASHLINK structure les échanges entre candidats, ateliers de confection et équipe de modération. L'administrateur fait le pont pour garantir des profils vérifiés et adaptés aux besoins."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 1. Interface Utilisateur / Candidat */}
        <div
          id="card-interface-talent"
          className="flex flex-col justify-between rounded-panel border border-royal-200 bg-white p-6 sm:p-7 shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-button bg-royal-50 text-royal-600">
                <UsersIcon className="h-6 w-6" />
              </span>
              <span className="rounded-full bg-royal-100/70 px-2.5 py-0.5 text-caption font-semibold text-royal-700">
                Interface 1
              </span>
            </div>

            <h3 className="mt-5 text-title-md font-bold text-midnight-900">
              Candidats & Talents
            </h3>
            <p className="mt-2 text-body-sm text-ink-muted">
              Pour les couturiers, modélistes, stylistes, artisans et créatifs de la mode africaine.
            </p>

            <ul className="mt-6 space-y-3 border-t border-line pt-5 text-body-sm text-ink">
              <li className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-royal-600" />
                <span>Création de profil professionnel, book et compétences</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-royal-600" />
                <span>Consultation des annonces validées par l&apos;administrateur</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-royal-600" />
                <span>Candidature en 1 clic avec suivi en temps réel</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-royal-600" />
                <span>Notification dès transmission du profil à la maison</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-line">
            <ButtonLink
              id="btn-goto-talent"
              href="/talent"
              variant="primary"
              className="w-full justify-center"
            >
              Accéder à l&apos;Espace Candidat
              <ArrowRightIcon className="h-4 w-4 ml-1.5" />
            </ButtonLink>
          </div>
        </div>

        {/* 2. Interface Marques & Maisons de Production */}
        <div
          id="card-interface-maison"
          className="flex flex-col justify-between rounded-panel border border-midnight-200 bg-white p-6 sm:p-7 shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-button bg-midnight-50 text-midnight-800">
                <BuildingIcon className="h-6 w-6" />
              </span>
              <span className="rounded-full bg-midnight-100 px-2.5 py-0.5 text-caption font-semibold text-midnight-800">
                Interface 2
              </span>
            </div>

            <h3 className="mt-5 text-title-md font-bold text-midnight-900">
              Maisons & Ateliers
            </h3>
            <p className="mt-2 text-body-sm text-ink-muted">
              Pour les ateliers de confection, marques de prêt-à-porter et maisons de création.
            </p>

            <ul className="mt-6 space-y-3 border-t border-line pt-5 text-body-sm text-ink">
              <li className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-midnight-700" />
                <span>Création de profil de marque et d&apos;atelier de production</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-midnight-700" />
                <span>
                  Publication d&apos;offres ciblées (ex : <em>&quot;Recherche 10 couturiers avec conditions&quot;</em>)
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-midnight-700" />
                <span>Suivi du statut de modération de chaque annonce</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-midnight-700" />
                <span>
                  Réception des profils qualifiés et recommandés par l&apos;admin
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-line">
            <ButtonLink
              id="btn-goto-maison"
              href="/recruteur"
              variant="secondary"
              className="w-full justify-center"
            >
              Accéder à l&apos;Espace Maison
              <ArrowRightIcon className="h-4 w-4 ml-1.5" />
            </ButtonLink>
          </div>
        </div>

        {/* 3. Interface Administrateur */}
        <div
          id="card-interface-admin"
          className="flex flex-col justify-between rounded-panel border border-amber-200 bg-amber-50/30 p-6 sm:p-7 shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-button bg-amber-100 text-amber-900">
                <ShieldCheckIcon className="h-6 w-6" />
              </span>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-caption font-semibold text-amber-900">
                Interface 3
              </span>
            </div>

            <h3 className="mt-5 text-title-md font-bold text-midnight-900">
              Administration FASHLINK
            </h3>
            <p className="mt-2 text-body-sm text-ink-muted">
              Le centre de contrôle, de validation des annonces et de sélection des candidats.
            </p>

            <ul className="mt-6 space-y-3 border-t border-amber-200/60 pt-5 text-body-sm text-ink">
              <li className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" />
                <span>Vue d&apos;ensemble et gestion des maisons de production</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" />
                <span>Validation & publication des offres pour les utilisateurs</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" />
                <span>Notification et réception des candidatures des talents</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" />
                <span>Analyse approfondie & transmission des profils aux maisons</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-amber-200/60">
            <ButtonLink
              id="btn-goto-admin"
              href="/admin"
              variant="outline"
              className="w-full justify-center border-amber-300 text-amber-950 hover:bg-amber-100/60"
            >
              Accéder à l&apos;Administration
              <ArrowRightIcon className="h-4 w-4 ml-1.5" />
            </ButtonLink>
          </div>
        </div>
      </div>
    </Section>
  );
}
