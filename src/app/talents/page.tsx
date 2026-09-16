import type { Metadata } from 'next';

import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { CategoriesSection } from '@/components/landing/CategoriesSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { FinalCta } from '@/components/landing/FinalCta';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { SlideDeck } from '@/components/onboarding/SlideDeck';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { TALENT_DECK } from '@/lib/onboarding-content';

export const metadata: Metadata = {
  title: 'Vous cherchez du travail dans la mode — FASHLINK',
  description:
    "Couture, modélisme, broderie, mannequinat, vente. Créez votre profil : les maisons de mode passent par FASHLINK pour recruter.",
};

/**
 * Entrée « talents ».
 *
 * Carrousel d'abord, contenu ensuite : le visiteur comprend en trois écrans de
 * quoi il s'agit, puis lit le détail s'il le souhaite, puis crée son compte.
 * Le bouton « Passer » du carrousel mène directement au contenu.
 *
 * Aucune section n'interroge la base : la page s'affiche même sans
 * `DATABASE_URL`.
 */
export default function TalentsPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <SlideDeck deck={TALENT_DECK} skipTargetId="avantages" />
        <BenefitsSection audience="talent" />
        <CategoriesSection />
        <HowItWorksSection />
        <FaqSection />
        <FinalCta audience="talent" />
      </main>

      <SiteFooter />
    </>
  );
}
