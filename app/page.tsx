import { HeroSection } from "@/components/sections/HeroSection";
import { ExplainerSection } from "@/components/sections/ExplainerSection";
import { BenefitsSection } from "@/components/sections/BenefitsSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ExplainerSection />
      <BenefitsSection />
    </main>
  );
}
