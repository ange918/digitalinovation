import { Section } from '@/components/landing/Section';
import { TALENT_STEPS } from '@/lib/landing-content';

/** Trois etapes, pour lever la crainte d'un parcours long. */
export function HowItWorksSection() {
  return (
    <Section
      id="fonctionnement"
      tone="white"
      eyebrow="En pratique"
      title="Trois étapes, et vous êtes visible"
    >
      <ol className="grid gap-8 md:grid-cols-3">
        {TALENT_STEPS.map((step) => (
          <li key={step.number} className="border-t-2 border-royal-500 pt-6">
            <span className="font-bold text-display-sm text-royal-500 tabular">
              {step.number}
            </span>
            <h3 className="mt-3 text-title-md text-midnight-900">{step.title}</h3>
            <p className="mt-2 text-body-sm text-ink-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
