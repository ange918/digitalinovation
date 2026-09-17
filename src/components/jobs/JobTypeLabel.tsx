import { JOB_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { JobType } from '@prisma/client';

/**
 * Marqueur de nature de contrat, en petites capitales precedees d'un tiret
 * cadratin : « — EMPLOI ».
 *
 * Volontairement pas une pastille coloree. Trois pastilles voisines dans une
 * liste se ressemblent trop pour etre lues au defilement, et faire porter la
 * distinction a la couleur seule exclut une partie des lecteurs. Ici c'est le
 * mot qui distingue ; la teinte ne fait que hierarchiser.
 */
const TONES: Record<JobType, string> = {
  EMPLOI: 'text-midnight-900',
  STAGE: 'text-ink-muted',
  FREELANCE: 'text-royal-600',
};

export function JobTypeLabel({
  jobType,
  className,
}: {
  jobType: JobType;
  className?: string;
}) {
  return (
    <span className={cn('fl-overline', TONES[jobType], className)}>
      <span aria-hidden="true">— </span>
      {JOB_TYPES[jobType].label.toUpperCase()}
    </span>
  );
}
