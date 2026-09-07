import { Suspense } from 'react';
import type { Metadata } from 'next';

import { AuthDialog } from '@/components/auth/AuthDialog';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { CategoriesSection } from '@/components/landing/CategoriesSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { FinalCta } from '@/components/landing/FinalCta';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { ThreeInterfacesSection } from '@/components/landing/ThreeInterfacesSection';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

export const metadata: Metadata = {
  title: 'FASHLINK — Plateforme d’emploi & production mode en Afrique',
  description:
    "Intermédiation structurée entre talents, maisons de production et modération. Annonces vérifiées, profils analysés et transmission directe.",
};

/**
 * Landing page FASHLINK.
 *
 * Articulée autour des trois interfaces :
 * 1. Utilisateurs / Talents
 * 2. Marques & Maisons de production
 * 3. Administration
 */
export default function LandingPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <HeroSection />
        <ThreeInterfacesSection />
        <BenefitsSection />
        <CategoriesSection />
        <HowItWorksSection />
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
