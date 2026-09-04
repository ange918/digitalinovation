'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button, ButtonLink } from '@/components/ui/Button';
import { CheckIcon } from '@/components/ui/Icons';
import { applyToJobAction } from '@/app/actions/applications';
import { cn } from '@/lib/utils';

interface ApplyButtonProps {
  jobId: string;
  jobSlug: string;
  viewerRole: 'TALENT' | 'RECRUITER' | 'ADMIN' | null;
  hasApplied: boolean;
  expiresAt: Date | string | null;
  fullWidth?: boolean;
}

/**
 * Candidature en un clic.
 *
 * Le clic ne demande rien : le profil, les categories et le CV deja presents
 * sur FASHLINK constituent le dossier. La lettre de motivation se rajoute
 * ensuite depuis l'espace candidat — on ne met jamais un formulaire entre un
 * talent et une offre.
 */
export function ApplyButton({
  jobId,
  jobSlug,
  viewerRole,
  hasApplied,
  expiresAt,
  fullWidth = false,
}: ApplyButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [applied, setApplied] = useState(hasApplied);
  const [error, setError] = useState<string | null>(null);

  const isExpired = expiresAt ? new Date(expiresAt).getTime() < Date.now() : false;
  const width = fullWidth ? 'w-full' : '';

  if (isExpired) {
    return (
      <Button variant="secondary" size="lg" className={width} disabled>
        Candidatures closes
      </Button>
    );
  }

  // Visiteur : on conserve la destination pour revenir sur l'offre apres connexion.
  if (viewerRole === null) {
    return (
      <ButtonLink
        href={`/connexion?next=${encodeURIComponent(`/offres/${jobSlug}`)}`}
        size="lg"
        className={width}
      >
        Se connecter pour postuler
      </ButtonLink>
    );
  }

  if (viewerRole !== 'TALENT') {
    return (
      <Button variant="secondary" size="lg" className={width} disabled>
        Reserve aux talents
      </Button>
    );
  }

  if (applied) {
    return (
      <div className={cn('flex flex-col gap-2', width)}>
        <Button variant="success" size="lg" className={width} disabled>
          <CheckIcon className="h-4 w-4" />
          Candidature envoyee
        </Button>
        <button
          type="button"
          onClick={() => router.push('/talent/candidatures')}
          className="text-caption text-ink-subtle underline-offset-2 hover:text-royal-600 hover:underline"
        >
          Suivre ma candidature
        </button>
      </div>
    );
  }

  function handleApply() {
    setError(null);
    startTransition(async () => {
      const result = await applyToJobAction({ jobId });
      if (result.ok) {
        setApplied(true);
        // Rafraichit les compteurs rendus cote serveur.
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className={cn('flex flex-col gap-2', width)}>
      <Button size="lg" className={width} loading={isPending} onClick={handleApply}>
        {isPending ? 'Envoi en cours' : 'Postuler en un clic'}
      </Button>
      {error && (
        <p role="alert" className="text-caption text-danger-700">
          {error}
        </p>
      )}
    </div>
  );
}
