"use client";

import { useState, useId } from "react";
import { SectionReveal } from "@/components/ui/SectionReveal";

const EEG_RATE = 6.8;
const SOLAR_MARKTWERT_2025 = 4.508;
const NETZENTGELT_BASE = 9.0;
const WEITERE_NEBENKOSTEN = 10.69;
const MARKTPREIS = 30.0;
const EINSPEISUNG_MIN = 5;
const EINSPEISUNG_MAX = 20;
const EINSPEISUNG_DEFAULT = 10;
const EINSPEISUNG_STEP = 0.1;

const EINSPEISEMENGE_MIN = 4000;
const EINSPEISEMENGE_MAX = 25000;
const EINSPEISEMENGE_DEFAULT = 6500;
const EINSPEISEMENGE_STEP = 100;

const VERBRAUCH_MIN = 2000;
const VERBRAUCH_MAX = 10000;
const VERBRAUCH_DEFAULT = 6000;
const VERBRAUCH_STEP = 100;

const ABDECKUNG_ANTEIL = 0.3;

// TODO: Link ggf. auf spezifische BNetzA-Konsultationsseite aktualisieren,
// sobald diese existiert. Aktuell Homepage als verifizierter Fallback.
const BNETZA_INFO_URL = "https://www.bundesnetzagentur.de/";

type ReduktionsStufe = {
  value: 0 | 28 | 64;
  label: string;
  subLabel: string;
  description: string;
  badge: "DE" | "AT";
};

const REDUKTIONS_STUFEN: ReduktionsStufe[] = [
  {
    value: 0,
    label: "Keine Reduktion",
    subLabel: "Deutschland — Stand heute",
    description:
      "Ohne Reduktion wird das Netzentgelt wie beim regulären Strombezug in voller Höhe fällig. Dies ist der Fallback, falls die Bundesnetzagentur keine Reduktion festlegt.",
    badge: "DE",
  },
  {
    value: 28,
    label: "28 % Reduktion",
    subLabel: "Österreich — selbes Umspannwerk",
    description:
      "Sharing-Partner hängen am selben Umspannwerk, aber an verschiedenen Trafostationen (Beispiel: Niedenstein ↔ Kirchberg).",
    badge: "AT",
  },
  {
    value: 64,
    label: "64 % Reduktion",
    subLabel: "Österreich — selbe Trafostation",
    description:
      "Direkte Nachbarschaft bzw. selbe Straße — Sharing-Partner hängen an derselben Trafostation.",
    badge: "AT",
  },
];

function verbraucherpreis(einspeise: number, reduktionPct: number): number {
  return einspeise + NETZENTGELT_BASE * (1 - reduktionPct / 100) + WEITERE_NEBENKOSTEN;
}

function mehrertragProzent(einspeise: number): number {
  return ((einspeise - EEG_RATE) / EEG_RATE) * 100;
}

function mehrertragMarktwertProzent(einspeise: number): number {
  return ((einspeise - SOLAR_MARKTWERT_2025) / SOLAR_MARKTWERT_2025) * 100;
}

function jahresmehrertragProduzentMarktwert(einspeise: number, kWh: number): number {
  return ((einspeise - SOLAR_MARKTWERT_2025) * kWh) / 100;
}

function ersparnisProzent(preis: number): number {
  return ((MARKTPREIS - preis) / MARKTPREIS) * 100;
}

function jahresersparnisVerbraucher(preis: number, kWh: number): number {
  return ((MARKTPREIS - preis) * kWh * ABDECKUNG_ANTEIL) / 100;
}

function jahresmehrertragProduzent(einspeise: number, kWh: number): number {
  return ((einspeise - EEG_RATE) * kWh) / 100;
}

const fmtCent = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const fmtPct = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const fmtEuro = new Intl.NumberFormat("de-DE", {
  maximumFractionDigits: 0,
});
const fmtKwh = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

export function CalculatorSection() {
  const [einspeiseverguetung, setEinspeiseverguetung] = useState(EINSPEISUNG_DEFAULT);
  const [einspeisemenge, setEinspeisemenge] = useState(EINSPEISEMENGE_DEFAULT);
  const [verbrauch, setVerbrauch] = useState(VERBRAUCH_DEFAULT);
  const [reduktion, setReduktion] = useState<0 | 28 | 64>(0);

  const sliderId = useId();
  const einspeisemengeId = useId();
  const verbrauchId = useId();
  const radioGroupId = useId();

  const preis = verbraucherpreis(einspeiseverguetung, reduktion);
  const mehrertrag = mehrertragProzent(einspeiseverguetung);
  const mehrertragMarkt = mehrertragMarktwertProzent(einspeiseverguetung);
  const ersparnis = ersparnisProzent(preis);
  const jahrVerbrauch = jahresersparnisVerbraucher(preis, verbrauch);
  const jahrProduktion = jahresmehrertragProduzent(einspeiseverguetung, einspeisemenge);
  const jahrProduktionMarkt = jahresmehrertragProduzentMarktwert(einspeiseverguetung, einspeisemenge);

  const aktuelleStufe = REDUKTIONS_STUFEN.find((s) => s.value === reduktion)!;

  const mehrertragSign = mehrertrag >= 0 ? "+" : "−";
  const mehrertragMarktSign = mehrertragMarkt >= 0 ? "+" : "−";
  const ersparnisIstPositiv = ersparnis >= 0;

  return (
    <section id="rechner" className="bg-bg px-6 py-16 md:py-30">
      <div className="mx-auto max-w-content">
        <SectionReveal>
          <h2 className="text-center">Was bringt dir Energy Sharing?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted">
            Spiel mit den Werten — sieh live, wie sich Preis und Erlös verändern.
          </p>
        </SectionReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Produzent */}
          <SectionReveal>
            <div className="h-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary-dark/10 md:p-8">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-sun">
                <span aria-hidden>☀️</span>
                <span>Produzent</span>
              </div>
              <h3 className="mt-1 font-serif text-xl text-primary-dark">
                Deine Einspeisevergütung
              </h3>

              <div className="mt-6">
                <div className="flex items-baseline justify-between">
                  <label htmlFor={sliderId} className="text-sm text-muted">
                    Vergütung pro kWh
                    <span className="ml-2 text-xs text-muted/80">
                      (EEG: {fmtCent.format(EEG_RATE)} ¢ · Solarmarktwert 2025:{" "}
                      {fmtCent.format(SOLAR_MARKTWERT_2025)} ¢)
                    </span>
                  </label>
                  <div className="font-serif text-3xl font-bold text-primary-dark">
                    {fmtCent.format(einspeiseverguetung)}{" "}
                    <span className="text-lg font-normal text-muted">¢/kWh</span>
                  </div>
                </div>

                <input
                  id={sliderId}
                  type="range"
                  min={EINSPEISUNG_MIN}
                  max={EINSPEISUNG_MAX}
                  step={EINSPEISUNG_STEP}
                  value={einspeiseverguetung}
                  onChange={(e) => setEinspeiseverguetung(parseFloat(e.target.value))}
                  aria-valuetext={`${fmtCent.format(einspeiseverguetung)} Cent pro Kilowattstunde`}
                  className="mt-3 w-full accent-primary"
                />
                <div className="mt-1 flex justify-between text-xs text-muted">
                  <span>{EINSPEISUNG_MIN} ¢</span>
                  <span>{EINSPEISUNG_MAX} ¢</span>
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-baseline justify-between">
                  <label htmlFor={einspeisemengeId} className="text-sm text-muted">
                    Jährliche Einspeisemenge
                  </label>
                  <div className="font-serif text-2xl font-bold text-primary-dark">
                    {fmtKwh.format(einspeisemenge)}{" "}
                    <span className="text-base font-normal text-muted">kWh</span>
                  </div>
                </div>
                <input
                  id={einspeisemengeId}
                  type="range"
                  min={EINSPEISEMENGE_MIN}
                  max={EINSPEISEMENGE_MAX}
                  step={EINSPEISEMENGE_STEP}
                  value={einspeisemenge}
                  onChange={(e) => setEinspeisemenge(parseInt(e.target.value, 10))}
                  aria-valuetext={`${fmtKwh.format(einspeisemenge)} Kilowattstunden pro Jahr`}
                  className="mt-3 w-full accent-primary"
                />
                <div className="mt-1 flex justify-between text-xs text-muted">
                  <span>{fmtKwh.format(EINSPEISEMENGE_MIN)} kWh</span>
                  <span>{fmtKwh.format(EINSPEISEMENGE_MAX)} kWh</span>
                </div>
              </div>
            </div>
          </SectionReveal>

          {/* Verbraucher */}
          <SectionReveal delay={0.1}>
            <div className="h-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary-dark/10 md:p-8">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
                <span aria-hidden>⚡</span>
                <span>Verbraucher</span>
              </div>
              <h3 className="mt-1 font-serif text-xl text-primary-dark">
                Reduktion der Netzentgelte
              </h3>

              <fieldset className="mt-6">
                <legend className="sr-only">Reduktionsstufe auswählen</legend>
                <div className="grid grid-cols-3 gap-2">
                  {REDUKTIONS_STUFEN.map((stufe) => {
                    const id = `${radioGroupId}-${stufe.value}`;
                    const selected = stufe.value === reduktion;
                    return (
                      <label
                        key={stufe.value}
                        htmlFor={id}
                        className={`relative flex cursor-pointer flex-col items-center gap-1 rounded-xl p-3 text-center ring-1 transition ${
                          selected
                            ? "bg-primary-pale ring-2 ring-primary"
                            : "bg-bg ring-transparent hover:ring-primary-pale"
                        }`}
                      >
                        <input
                          id={id}
                          type="radio"
                          name={radioGroupId}
                          value={stufe.value}
                          checked={selected}
                          onChange={() => setReduktion(stufe.value)}
                          className="sr-only"
                        />
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            stufe.badge === "AT"
                              ? "bg-sun-light text-sun"
                              : "bg-white text-primary-dark ring-1 ring-primary-dark/10"
                          }`}
                        >
                          {stufe.badge === "AT" ? "🇦🇹 AT" : "🇩🇪 DE"}
                        </span>
                        <span
                          className={`font-serif text-xl font-bold leading-none ${selected ? "text-primary-dark" : "text-ink"}`}
                        >
                          {stufe.value} %
                        </span>
                        <span className="text-[11px] leading-tight text-muted">
                          {stufe.subLabel}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <p className="mt-4 text-sm text-muted">{aktuelleStufe.description}</p>

              <details className="group mt-3">
                <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full bg-primary-pale/60 px-3 py-1.5 text-xs font-semibold text-primary-dark transition hover:bg-primary-pale">
                  <span
                    aria-hidden
                    className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white"
                  >
                    i
                  </span>
                  <span className="underline underline-offset-2 decoration-primary/40">
                    Warum 28 % / 64 %? Wie ist der Stand in Deutschland?
                  </span>
                  <span className="text-primary transition group-open:rotate-90" aria-hidden>
                    ▸
                  </span>
                </summary>
                <div className="mt-2 rounded-lg bg-sun-light/60 p-3 text-xs leading-relaxed text-primary-dark/80">
                  Die 28 % und 64 % gelten aktuell in Österreich. Ob und in welcher
                  Höhe Deutschland eine Reduktion einführt, entscheidet die
                  Bundesnetzagentur.{" "}
                  <a
                    href={BNETZA_INFO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary underline underline-offset-2 hover:text-primary-dark"
                  >
                    Mehr erfahren →
                  </a>
                </div>
              </details>

              <div className="mt-8">
                <div className="flex items-baseline justify-between">
                  <label htmlFor={verbrauchId} className="text-sm text-muted">
                    Jährlicher Stromverbrauch
                  </label>
                  <div className="font-serif text-2xl font-bold text-primary-dark">
                    {fmtKwh.format(verbrauch)}{" "}
                    <span className="text-base font-normal text-muted">kWh</span>
                  </div>
                </div>
                <input
                  id={verbrauchId}
                  type="range"
                  min={VERBRAUCH_MIN}
                  max={VERBRAUCH_MAX}
                  step={VERBRAUCH_STEP}
                  value={verbrauch}
                  onChange={(e) => setVerbrauch(parseInt(e.target.value, 10))}
                  aria-valuetext={`${fmtKwh.format(verbrauch)} Kilowattstunden pro Jahr`}
                  className="mt-3 w-full accent-primary"
                />
                <div className="mt-1 flex justify-between text-xs text-muted">
                  <span>{fmtKwh.format(VERBRAUCH_MIN)} kWh</span>
                  <span>{fmtKwh.format(VERBRAUCH_MAX)} kWh</span>
                </div>

                <details className="group mt-3">
                  <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full bg-primary-pale/60 px-3 py-1.5 text-xs font-semibold text-primary-dark transition hover:bg-primary-pale">
                    <span
                      aria-hidden
                      className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white"
                    >
                      i
                    </span>
                    <span className="underline underline-offset-2 decoration-primary/40">
                      Warum rechnen wir nur mit{" "}
                      {Math.round(ABDECKUNG_ANTEIL * 100)} % Sharing-Anteil?
                    </span>
                    <span className="text-primary transition group-open:rotate-90" aria-hidden>
                      ▸
                    </span>
                  </summary>
                  <div className="mt-2 rounded-lg bg-primary-pale/50 p-3 text-xs leading-relaxed text-primary-dark/80">
                    Sonne scheint nicht rund um die Uhr — realistisch lassen sich ohne
                    Speicher ca. {Math.round(ABDECKUNG_ANTEIL * 100)} % deines
                    Jahresverbrauchs direkt über Sharing abdecken. Der Rest läuft
                    weiter über deinen regulären Tarif. Mit zukünftigen
                    Speicherlösungen wird dieser Anteil steigen.
                  </div>
                </details>
              </div>
            </div>
          </SectionReveal>
        </div>

        {/* Ergebnisband */}
        <SectionReveal delay={0.2}>
          <div
            className="mt-6 rounded-2xl bg-primary-dark p-6 text-white shadow-sm md:p-10"
            aria-live="polite"
          >
            <div className="grid gap-8 md:grid-cols-2">
              {/* Produzenten-Ergebnis */}
              <div>
                <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-primary-pale/80">
                  <span aria-hidden>☀️</span>
                  <span>Produzent bekommt</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-6">
                  <div>
                    <div className="font-serif text-4xl font-bold">
                      <span
                        className={
                          mehrertrag >= 0 ? "text-primary-light" : "text-sun-light"
                        }
                      >
                        {mehrertragSign}
                        {fmtPct.format(Math.abs(mehrertrag))} %
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-primary-pale/90">
                      gegenüber EEG
                      <br />
                      <span className="text-primary-pale/70">
                        ({fmtCent.format(EEG_RATE)} ¢/kWh)
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-serif text-4xl font-bold">
                        <span
                          className={
                            mehrertragMarkt >= 0
                              ? "text-primary-light"
                              : "text-sun-light"
                          }
                        >
                          {mehrertragMarktSign}
                          {fmtPct.format(Math.abs(mehrertragMarkt))} %
                        </span>
                      </div>
                      <details className="group relative">
                        <summary
                          aria-label="Was ist der Solarmarktwert?"
                          className="flex h-5 w-5 cursor-pointer list-none items-center justify-center rounded-full bg-primary-pale/20 text-[11px] font-bold text-primary-pale ring-1 ring-primary-pale/40 transition hover:bg-primary-pale/30"
                        >
                          i
                        </summary>
                        <div className="absolute left-0 top-7 z-10 w-72 rounded-lg bg-white p-3 text-xs leading-relaxed text-primary-dark shadow-lg ring-1 ring-primary-dark/10">
                          Wenn die aktuelle EEG-Novelle so in Kraft tritt, wie die
                          CDU (Frau Reiche) es vorsieht, bekommen PV-Anlagen in
                          Zukunft keine EEG-Vergütung mehr, sondern müssen in die
                          Direktvermarktung, wo sie den aktuell gültigen
                          Börsenstrompreis bekommen. Dieser lag im Schnitt 2025
                          bei {fmtCent.format(SOLAR_MARKTWERT_2025)} ¢/kWh.
                        </div>
                      </details>
                    </div>
                    <div className="mt-2 text-sm text-primary-pale/90">
                      gegenüber Solarmarktwert 2025
                      <br />
                      <span className="text-primary-pale/70">
                        ({fmtCent.format(SOLAR_MARKTWERT_2025)} ¢/kWh)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-primary-pale/80">
                  Bei {fmtKwh.format(einspeisemenge)} kWh Einspeisung pro Jahr
                </div>
                <div className="font-serif text-2xl font-bold">
                  {jahrProduktion >= 0 ? "+" : "−"}
                  {fmtEuro.format(Math.abs(jahrProduktion))} € / Jahr
                  <span className="ml-1 text-sm font-normal text-primary-pale/80">
                    vs. EEG
                  </span>
                </div>
                <div className="font-serif text-2xl font-bold">
                  {jahrProduktionMarkt >= 0 ? "+" : "−"}
                  {fmtEuro.format(Math.abs(jahrProduktionMarkt))} € / Jahr
                  <span className="ml-1 text-sm font-normal text-primary-pale/80">
                    vs. Marktwert
                  </span>
                </div>
              </div>

              {/* Verbraucher-Ergebnis */}
              <div className="border-t border-white/15 pt-8 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-primary-pale/80">
                  <span aria-hidden>⚡</span>
                  <span>Verbraucher zahlt</span>
                </div>
                <div className="mt-2 font-serif text-5xl font-bold">
                  {fmtCent.format(preis)}
                  <span className="ml-2 text-2xl font-normal text-primary-pale/90">
                    ¢/kWh
                  </span>
                </div>
                <div className="mt-2 text-sm text-primary-pale/90">
                  gegenüber {fmtCent.format(MARKTPREIS)} ¢ Marktpreis →{" "}
                  <span
                    className={`font-semibold ${
                      ersparnisIstPositiv ? "text-primary-light" : "text-sun-light"
                    }`}
                  >
                    {fmtPct.format(Math.abs(ersparnis))} %{" "}
                    {ersparnisIstPositiv ? "günstiger" : "teurer"}
                  </span>
                </div>
                <div className="mt-4 text-sm text-primary-pale/80">
                  Bei {fmtKwh.format(verbrauch)} kWh Verbrauch ({Math.round(ABDECKUNG_ANTEIL * 100)} % via Sharing)
                </div>
                <div className="font-serif text-2xl font-bold">
                  {jahrVerbrauch >= 0 ? "" : "−"}
                  {fmtEuro.format(Math.abs(jahrVerbrauch))} € / Jahr{" "}
                  {jahrVerbrauch >= 0 ? "gespart" : "mehr"}
                </div>
                {reduktion === 0 && jahrVerbrauch < 50 && (
                  <div className="mt-4 flex gap-3 rounded-lg bg-sun-light/15 p-3 text-xs leading-relaxed text-primary-pale ring-1 ring-sun-light/30">
                    <span aria-hidden className="text-sun-light">💡</span>
                    <span>
                      Energy Sharing lohnt sich für Verbraucher vor allem dann
                      richtig, wenn die <strong>Netzentgelte reduziert</strong>{" "}
                      werden. Das ergibt auch Sinn: Wird der Strom lokal
                      verbraucht, werden die Netze weniger beansprucht und
                      müssen weniger stark ausgebaut werden. Genau das soll die
                      Bundesnetzagentur in Deutschland noch festlegen.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-8 border-t border-white/15 pt-6 text-xs leading-relaxed text-primary-pale/70">
              *Vereinfachte Darstellung, ohne Gewähr. Basiswerte: Netzentgelt{" "}
              {fmtCent.format(NETZENTGELT_BASE)} ¢/kWh (reduzierbarer Anteil), weitere
              Nebenkosten {fmtCent.format(WEITERE_NEBENKOSTEN)} ¢/kWh (Steuern, Abgaben,
              MwSt), aktuelle EEG-Einspeisevergütung {fmtCent.format(EEG_RATE)} ¢/kWh,
              durchschnittlicher Marktpreis {fmtCent.format(MARKTPREIS)} ¢/kWh.
            </p>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
