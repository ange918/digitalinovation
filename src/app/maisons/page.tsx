import type { Metadata } from 'next';

import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { CategoriesSection } from '@/components/landing/CategoriesSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { FinalCta } from '@/components/landing/FinalCta';
import { ThreeInterfacesSection } from '@/components/landing/ThreeInterfacesSection';
import { SlideDeck } from '@/components/onboarding/SlideDeck';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { MAISON_DECK } from '@/lib/onboarding-content';

export const metadata: Metadata = {
  title: 'Vous cherchez de la main-d’œuvre — FASHLINK',
  description:
    "Maisons de mode, marques, ateliers de production : exprimez votre besoin, FASHLINK recrute et met des professionnels qualifiés à votre disposition.",
};

/**
 * Entrée « maisons de mode ».
 *
 * Même structure que /talents, mais le propos change : on ne vend pas un
 * annuaire, on vend une prise en charge. D'où `ThreeInterfacesSection`, qui
 * explique le circuit — la maison exprime son besoin, FASHLINK l'instruit et
 * le publie, les talents postulent.
 */
export default function MaisonsPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <SlideDeck deck={MAISON_DECK} skipTargetId="avantages" />
        <BenefitsSection audience="maison" />
        <ThreeInterfacesSection />
        <CategoriesSection />
        <FaqSection />
        <FinalCta audience="maison" />
      </main>

      <SiteFooter />
    </>
  );
}
