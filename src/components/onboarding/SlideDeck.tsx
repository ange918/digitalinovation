'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button, ButtonLink } from '@/components/ui/Button';
import { ArrowRightIcon } from '@/components/ui/Icons';
import type { Deck } from '@/lib/onboarding-content';
import { cn } from '@/lib/utils';

interface SlideDeckProps {
  deck: Deck;
  /** Ancre vers laquelle « Passer » fait défiler, sous le carrousel. */
  skipTargetId: string;
}

/**
 * Carrousel d'accueil, façon application mobile.
 *
 * Aucune librairie : la navigation tient en quelques dizaines de lignes, et le
 * projet n'embarque aucune dépendance d'interface. En importer une pour trois
 * diapositives coûterait plus cher en bande passante que tout le reste de la
 * page — ce qui compte sur les réseaux visés.
 */
export function SlideDeck({ deck, skipTargetId }: SlideDeckProps) {
  const [index, setIndex] = useState(0);
  const liveRef = useRef<HTMLParagraphElement>(null);
  const pointerStart = useRef<number | null>(null);

  const total = deck.slides.length;
  const slide = deck.slides[index];
  const isLast = index === total - 1;

  const goTo = useCallback(
    (next: number) => setIndex(Math.max(0, Math.min(total - 1, next))),
    [total],
  );

  // Flèches du clavier : le carrousel doit être utilisable sans souris.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') goTo(index + 1);
      if (event.key === 'ArrowLeft') goTo(index - 1);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [index, goTo]);

  // Glissement tactile. `pointer*` couvre doigt, stylet et souris d'un seul jeu
  // d'événements, là où `touch*` laisserait le bureau de côté.
  function onPointerDown(event: React.PointerEvent) {
    pointerStart.current = event.clientX;
  }

  function onPointerUp(event: React.PointerEvent) {
    if (pointerStart.current === null) return;
    const delta = event.clientX - pointerStart.current;
    pointerStart.current = null;
    // 48 px : au-delà du tremblement d'un appui, en deçà d'un geste ample.
    if (Math.abs(delta) < 48) return;
    goTo(delta < 0 ? index + 1 : index - 1);
  }

  const signupHref = `?auth=inscription&role=${deck.role}`;

  return (
    <section
      aria-roledescription="carrousel"
      aria-label="Présentation"
      className="relative overflow-hidden border-b border-line bg-midnight-900 text-white"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (pointerStart.current = null)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-royal-500/20 blur-3xl"
      />

      <div className="container relative flex min-h-[32rem] flex-col justify-between py-16 sm:min-h-[36rem] sm:py-20">
        {/* ---- Diapositive courante ---- */}
        <div className="flex flex-1 items-center">
          <div key={index} className="max-w-2xl animate-fade-in-up">
            {slide.eyebrow && (
              <p className="fl-overline text-royal-300">{slide.eyebrow}</p>
            )}

            <h1 className="mt-5 text-display-sm font-bold leading-[1.1] text-white sm:text-display-md">
              {slide.title}
            </h1>

            <p className="mt-6 max-w-xl text-body-lg text-white/70">{slide.body}</p>

            {isLast && (
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={signupHref} size="lg">
                  {deck.ctaLabel}
                  <ArrowRightIcon className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink
                  href="?auth=connexion"
                  size="lg"
                  variant="secondary"
                  className="bg-transparent text-white ring-white/25 hover:bg-white/10 hover:ring-white/40"
                >
                  J&apos;ai déjà un compte
                </ButtonLink>
              </div>
            )}
          </div>
        </div>

        {/* Annonce du changement pour les lecteurs d'écran. */}
        <p ref={liveRef} aria-live="polite" className="sr-only">
          Diapositive {index + 1} sur {total} : {slide.title}
        </p>

        {/* ---- Commandes ---- */}
        <div className="mt-12 flex items-center justify-between gap-6">
          <ol className="flex items-center gap-2">
            {deck.slides.map((item, position) => (
              <li key={item.title}>
                <button
                  type="button"
                  onClick={() => goTo(position)}
                  aria-label={`Aller à la diapositive ${position + 1} : ${item.title}`}
                  aria-current={position === index ? 'true' : undefined}
                  className={cn(
                    'h-1.5 rounded-pill transition-all duration-250 ease-editorial',
                    position === index
                      ? 'w-8 bg-royal-400'
                      : 'w-1.5 bg-white/25 hover:bg-white/50',
                  )}
                />
              </li>
            ))}
          </ol>

          <div className="flex items-center gap-4">
            {!isLast && (
              <Link
                href={`#${skipTargetId}`}
                className="text-body-sm font-medium text-white/50 transition-colors hover:text-white"
              >
                Passer
              </Link>
            )}

            {isLast ? (
              <Link
                href={`#${skipTargetId}`}
                className="inline-flex h-10 items-center gap-2 rounded-pill bg-white/10 px-5 text-body-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                En savoir plus
              </Link>
            ) : (
              <Button size="md" onClick={() => goTo(index + 1)}>
                Suivant
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
