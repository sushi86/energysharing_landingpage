import { HeroSection } from "@/components/sections/HeroSection";
import { ExplainerSection } from "@/components/sections/ExplainerSection";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { AustriaSection } from "@/components/sections/AustriaSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ExplainerSection />
      <BenefitsSection />
      <AustriaSection />
    </main>
  );
}
