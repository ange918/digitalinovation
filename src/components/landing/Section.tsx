import { cn } from '@/lib/utils';

/**
 * Coquille commune a toutes les sections de la landing.
 * Centralise le rythme vertical et l'en-tete surtitre + titre + chapo, pour
 * que les sept sections respirent exactement de la meme facon.
 */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  tone = 'canvas',
  children,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  tone?: 'canvas' | 'white' | 'warm' | 'midnight';
  children: React.ReactNode;
  className?: string;
}) {
  const tones = {
    canvas: 'bg-canvas',
    white: 'bg-white',
    warm: 'bg-canvas-warm',
    midnight: 'bg-midnight-900 text-white',
  };

  return (
    <section
      id={id}
      className={cn('border-b border-line py-20 sm:py-26', tones[tone], className)}
      // Compense le header colle pour que l'ancre ne passe pas sous la barre.
      style={{ scrollMarginTop: 'var(--fl-header-height)' }}
    >
      <div className="container">
        {(eyebrow || title) && (
          <header className="max-w-2xl">
            {eyebrow && (
              <p
                className={cn(
                  'fl-overline',
                  tone === 'midnight' ? 'text-royal-300' : 'text-royal-600',
                )}
              >
                {eyebrow}
              </p>
            )}
            {title && (
              <h2
                className={cn(
                  'mt-4 font-serif text-display-sm sm:text-display-md',
                  tone === 'midnight' ? 'text-white' : 'text-midnight-900',
                )}
              >
                {title}
              </h2>
            )}
            {intro && (
              <p
                className={cn(
                  'mt-5 text-body-lg',
                  tone === 'midnight' ? 'text-white/70' : 'text-ink-muted',
                )}
              >
                {intro}
              </p>
            )}
          </header>
        )}

        <div className={cn(eyebrow || title ? 'mt-12' : '')}>{children}</div>
      </div>
    </section>
  );
}
