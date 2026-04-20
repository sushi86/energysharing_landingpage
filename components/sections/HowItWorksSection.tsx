import { SectionReveal } from "@/components/ui/SectionReveal";

const STEPS = [
  {
    icon: "📊",
    title: "Ein moderner Stromzähler wird eingebaut",
    body: "Er misst automatisch alle 15 Minuten — so weiß die Abrechnung genau, wann was geflossen ist.",
  },
  {
    icon: "☁️",
    title: "Die Daten zeigen wann wer Strom braucht",
    body: "Wir sehen, wann deine Anlage produziert und wann dein Nachbar Strom bezieht.",
  },
  {
    icon: "💶",
    title: "Die Plattform rechnet automatisch ab",
    body: "Du bekommst monatlich eine transparente Übersicht — ohne dass du etwas tun musst.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="wie-funktioniert-es" className="px-6 py-16 md:py-30">
      <div className="mx-auto max-w-content">
        <SectionReveal>
          <h2 className="text-center">Klingt kompliziert — ist es nicht</h2>
        </SectionReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <SectionReveal key={step.title} delay={0.1 * i}>
              <div className="h-full rounded-2xl bg-white p-8 shadow-sm ring-1 ring-primary-pale">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-pale text-3xl" aria-hidden>
                  {step.icon}
                </div>
                <div className="text-sm font-semibold uppercase tracking-wide text-primary-light">
                  Schritt {i + 1}
                </div>
                <h3 className="mt-1 font-serif text-xl text-primary-dark">{step.title}</h3>
                <p className="mt-3 text-muted">{step.body}</p>
              </div>
            </SectionReveal>
          ))}
        </div>

        <SectionReveal delay={0.4}>
          <div className="mt-10 rounded-2xl bg-primary-pale p-6 text-primary-dark">
            <strong>Wichtig:</strong> Den Stromzähler baut der Messstellenbetreiber ein — du musst nichts tun außer zustimmen. Für viele Haushalte mit Solaranlage ist das sogar bereits Pflicht.
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
