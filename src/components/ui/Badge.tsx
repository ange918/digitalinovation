import { cn } from '@/lib/utils';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'royal';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-canvas-alt text-ink-muted ring-line',
  info: 'bg-royal-50 text-royal-700 ring-royal-200',
  success: 'bg-success-50 text-success-700 ring-success-500/20',
  warning: 'bg-warning-50 text-warning-700 ring-warning-500/20',
  danger: 'bg-danger-50 text-danger-700 ring-danger-500/20',
  royal: 'bg-royal-500 text-white ring-royal-500',
};

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}

/**
 * Pastille de statut. Bordure interne (`ring`) plutot que `border` : la
 * pastille ne prend pas un pixel de plus et reste alignee sur la ligne de base.
 */
export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1',
        'text-caption font-medium ring-1 ring-inset',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Point colore precedant un libelle de statut. */
export function StatusDot({ tone = 'neutral' }: { tone?: BadgeTone }) {
  const dot: Record<BadgeTone, string> = {
    neutral: 'bg-ink-faint',
    info: 'bg-royal-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    royal: 'bg-white',
  };
  return <span className={cn('h-1.5 w-1.5 rounded-full', dot[tone])} aria-hidden="true" />;
}
