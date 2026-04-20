import { SectionReveal } from "@/components/ui/SectionReveal";
import { EnergyFlowAnimation } from "@/components/ui/EnergyFlowAnimation";

const STEPS = [
  {
    icon: "☀️",
    title: "Deine Anlage produziert mehr als du brauchst",
    body: "An sonnigen Tagen erzeugt eine PV-Anlage oft mehr Strom, als im Haushalt verbraucht wird.",
  },
  {
    icon: "🏘️",
    title: "Dein Überschuss fließt zu Nachbarn im Ort",
    body: "Statt anonym ins große Netz einzuspeisen, geht der Strom an Nachbarn in deiner Gemeinde.",
  },
  {
    icon: "💶",
    title: "Beide profitieren",
    body: "Du verdienst mehr als bei normaler Einspeisung — dein Nachbar zahlt weniger als für normalen Netzstrom.",
  },
];

export function ExplainerSection() {
  return (
    <section id="was-ist-es" className="px-6 py-16 md:py-30">
      <div className="mx-auto max-w-content">
        <SectionReveal>
          <h2 className="text-center">Was ist Energy Sharing?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted">
            Stell dir vor: dein Nachbar hat Solarstrom im Überschuss, du brauchst gerade Strom. Statt umständlicher Wege geht der Strom direkt zu dir — und beide sparen.
          </p>
        </SectionReveal>

        <SectionReveal delay={0.15} className="mt-12 flex justify-center">
          <EnergyFlowAnimation />
        </SectionReveal>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <SectionReveal key={step.title} delay={0.1 * i}>
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary-pale">
                <div className="mb-4 text-4xl" aria-hidden>{step.icon}</div>
                <h3 className="font-serif text-xl text-primary-dark">{step.title}</h3>
                <p className="mt-2 text-muted">{step.body}</p>
              </div>
            </SectionReveal>
          ))}
        </div>

        <SectionReveal delay={0.4}>
          <div className="mt-12 rounded-2xl bg-primary-pale p-6 text-center text-primary-dark">
            <strong>Wichtig:</strong> Dein bisheriger Stromvertrag bleibt — du musst nichts kündigen oder wechseln.
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
