import { HeroSection } from "@/components/sections/HeroSection";
import { ExplainerSection } from "@/components/sections/ExplainerSection";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { AustriaSection } from "@/components/sections/AustriaSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { TimelineSection } from "@/components/sections/TimelineSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ExplainerSection />
      <BenefitsSection />
      <AustriaSection />
      <HowItWorksSection />
      <TimelineSection />
    </main>
  );
}
