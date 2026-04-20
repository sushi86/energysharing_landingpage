import { HeroSection } from "@/components/sections/HeroSection";
import { ExplainerSection } from "@/components/sections/ExplainerSection";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { AustriaSection } from "@/components/sections/AustriaSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { TimelineSection } from "@/components/sections/TimelineSection";
import { CalculatorSection } from "@/components/sections/CalculatorSection";
import { WaitlistSection } from "@/components/sections/WaitlistSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <main>
        <HeroSection />
        <ExplainerSection />
        <BenefitsSection />
        <AustriaSection />
        <HowItWorksSection />
        <TimelineSection />
        <CalculatorSection />
        <WaitlistSection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
