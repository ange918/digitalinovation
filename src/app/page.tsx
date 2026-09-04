import { Suspense } from 'react';
import type { Metadata } from 'next';

import { AuthDialog } from '@/components/auth/AuthDialog';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { CategoriesSection } from '@/components/landing/CategoriesSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { FinalCta } from '@/components/landing/FinalCta';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

export const metadata: Metadata = {
  title: 'FASHLINK — Emploi, stage et freelance dans la mode',
  description:
    "Entrez dans la base de talents de la mode en Afrique francophone. Profil gratuit, book en ligne, candidature en un clic. Les maisons recrutent ici.",
};

/**
 * Landing page unique.
 *
 * Tout le parcours de decouverte tient sur cette page : ce qu'on gagne a
 * s'inscrire, les six categories, le fonctionnement, les tarifs detailles et
 * les questions frequentes. Connexion et inscription s'ouvrent en fenetre
 * modale — le visiteur ne quitte jamais la page.
 *
 * Aucune section n'interroge la base de donnees : la landing s'affiche
 * integralement meme sans `DATABASE_URL`.
 */
export default function LandingPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <HeroSection />
        <BenefitsSection />
        <CategoriesSection />
        <HowItWorksSection />
        <PricingSection />
        <FaqSection />
        <FinalCta />
      </main>

      <SiteFooter />

      {/* `useSearchParams` impose une frontiere Suspense cote App Router. */}
      <Suspense fallback={null}>
        <AuthDialog />
      </Suspense>
    </>
  );
}
