import { SectionReveal } from "@/components/ui/SectionReveal";

const POINTS = [
  {
    when: "Jetzt",
    title: "Pilotprojekt Niedenstein",
    body: "Wir sammeln Interessenten, klären die technischen Voraussetzungen und bauen die Gemeinschaft auf.",
    active: true,
  },
  {
    when: "Juni 2026",
    title: "Gesetz tritt in Kraft",
    body: "§42c EnWG ermöglicht Energy Sharing offiziell in Deutschland.",
  },
  {
    when: "2027",
    title: "Automatisierte Abrechnung",
    body: "Die Prozesse zwischen Netzbetreiber und Plattform laufen automatisiert.",
  },
  {
    when: "2028",
    title: "Erweiterung",
    body: "Energy Sharing wird auch zwischen benachbarten Netzgebieten möglich.",
  },
];

export function TimelineSection() {
  return (
    <section id="fahrplan" className="bg-bg px-6 py-16 md:py-30">
      <div className="mx-auto max-w-content">
        <SectionReveal>
          <h2 className="text-center">Unser Fahrplan</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted">
            Ehrlich und transparent: was geht jetzt schon, und was kommt wann?
          </p>
        </SectionReveal>

        <div className="relative mt-16">
          <div className="absolute left-6 top-0 hidden h-full w-0.5 bg-primary-pale md:left-0 md:top-6 md:h-0.5 md:w-full md:block" aria-hidden />

          <ol className="relative grid gap-12 md:grid-cols-4 md:gap-6">
            {POINTS.map((p, i) => (
              <SectionReveal key={p.title} delay={0.1 * i}>
                <li className="relative pl-16 md:pl-0 md:pt-16">
                  <div
                    className={`absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold md:left-1/2 md:-translate-x-1/2 ${
                      p.active
                        ? "bg-primary text-white ring-4 ring-primary-light/40"
                        : "bg-white text-primary ring-2 ring-primary-pale"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className={p.active ? "rounded-2xl bg-primary-pale p-5" : "p-5"}>
                    <div className="text-sm font-semibold uppercase tracking-wide text-primary-light">
                      {p.when}
                    </div>
                    <h3 className="mt-1 font-serif text-lg text-primary-dark">{p.title}</h3>
                    <p className="mt-2 text-sm text-muted">{p.body}</p>
                  </div>
                </li>
              </SectionReveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
