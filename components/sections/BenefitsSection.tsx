import { SectionReveal } from "@/components/ui/SectionReveal";

const PRODUCER_BENEFITS = [
  "Deutlich mehr Erlös als die EEG-Einspeisung (aktuell nur ~6,8 Cent/kWh — und mit der geplanten EEG-Novelle bald womöglich gar nichts mehr)",
  "Dein Strom bleibt im Ort — statt anonym ins Netz",
  "Kein Aufwand — die Plattform übernimmt die Abrechnung",
  "Flexibel: du bestimmst den Preis selbst",
];

const CONSUMER_BENEFITS = [
  "Günstiger als normaler Netzstrom",
  "Strom aus der Nachbarschaft — regional und erneuerbar",
  "Dein bestehender Stromvertrag bleibt",
  "Auch ohne eigene Solaranlage dabei sein",
];

export function BenefitsSection() {
  return (
    <section id="vorteile" className="bg-bg px-6 py-16 md:py-30">
      <div className="mx-auto max-w-content">
        <SectionReveal>
          <h2 className="text-center">Zwei Perspektiven, ein Projekt</h2>
        </SectionReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <SectionReveal delay={0.1}>
            <div className="h-full rounded-2xl bg-sun-light p-8 ring-1 ring-sun/30">
              <div className="mb-4 text-3xl" aria-hidden>☀️</div>
              <h3 className="font-serif">Du hast eine Solaranlage</h3>
              <ul className="mt-6 space-y-3">
                {PRODUCER_BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span aria-hidden className="mt-1 text-sun">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.2}>
            <div className="h-full rounded-2xl bg-primary-pale p-8 ring-1 ring-primary/30">
              <div className="mb-4 text-3xl" aria-hidden>⚡</div>
              <h3 className="font-serif">Du möchtest günstigeren Strom</h3>
              <ul className="mt-6 space-y-3">
                {CONSUMER_BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span aria-hidden className="mt-1 text-primary">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
