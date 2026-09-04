import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  // Le bleu roi n'apparait qu'ici : une seule action primaire par ecran.
  primary:
    'bg-royal-500 text-white shadow-royal hover:bg-royal-600 active:bg-royal-700 disabled:bg-royal-200',
  secondary:
    'bg-white text-midnight-900 ring-1 ring-inset ring-line-strong hover:bg-canvas-alt hover:ring-midnight-300 disabled:text-ink-faint',
  ghost: 'bg-transparent text-ink-muted hover:bg-canvas-alt hover:text-midnight-900',
  danger:
    'bg-white text-danger-700 ring-1 ring-inset ring-danger-500/30 hover:bg-danger-50 disabled:text-ink-faint',
  success:
    'bg-success-500 text-white hover:bg-success-700 disabled:bg-success-500/40',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-caption gap-1.5',
  md: 'h-10 px-4 text-body-sm gap-2',
  lg: 'h-12 px-6 text-body gap-2',
};

const BASE = cn(
  'inline-flex items-center justify-center rounded-pill font-semibold',
  'transition-all duration-150 ease-editorial',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal-500 focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:shadow-none',
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

interface ButtonLinkProps extends React.ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...props}>
      {children}
    </Link>
  );
}

function Spinner() {
  return (
    <svg
      className="h-3.5 w-3.5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
