import { Section } from '@/components/landing/Section';
import { FAQ } from '@/lib/landing-content';

/**
 * Questions fréquentes.
 *
 * Balise `<details>` native : l'accordeon fonctionne sans une ligne de
 * JavaScript, reste accessible au clavier et lisible par les moteurs de
 * recherche. Sur un reseau lent, c'est exactement ce qu'on veut.
 */
export function FaqSection() {
  return (
    <Section
      id="faq"
      tone="white"
      eyebrow="Questions fréquentes"
      title="Ce qu’on nous demande le plus"
    >
      <div className="max-w-prose divide-y divide-line-subtle border-y border-line-subtle">
        {FAQ.map((item) => (
          <details key={item.question} className="group py-5">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-body font-semibold text-midnight-900 marker:hidden">
              {item.question}
              <span
                aria-hidden="true"
                className="mt-1 shrink-0 text-ink-faint transition-transform duration-250 ease-editorial group-open:rotate-45"
              >
                <PlusIcon />
              </span>
            </summary>
            <p className="mt-3 pr-8 text-body-sm text-ink-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
    >
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}
