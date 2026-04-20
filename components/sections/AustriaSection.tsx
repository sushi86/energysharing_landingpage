"use client";

import Image from "next/image";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { CounterAnimation } from "@/components/ui/CounterAnimation";

export function AustriaSection() {
  return (
    <section id="oesterreich" className="bg-primary-pale px-6 py-16 md:py-30">
      <div className="mx-auto max-w-content">
        <SectionReveal>
          <h2 className="text-center">In Österreich klappt es längst</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-primary-dark">
            Österreich hat das Konzept 2021 eingeführt. Heute ist es dort gelebter Alltag. Deutschland folgt ab Juni 2026.
          </p>
        </SectionReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { value: 5500, suffix: "+", label: "Energiegemeinschaften" },
            { value: 100000, suffix: "+", label: "beteiligte Haushalte" },
            { value: 2021, label: "seit diesem Jahr in Betrieb", raw: true },
          ].map((stat, i) => (
            <SectionReveal key={stat.label} delay={0.1 * i}>
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <div className="font-serif text-4xl text-primary-dark md:text-5xl">
                  <CounterAnimation
                    to={stat.value}
                    format={
                      stat.raw
                        ? (n) => String(n)
                        : (n) => `${n.toLocaleString("de-DE")}${stat.suffix ?? ""}`
                    }
                  />
                </div>
                <p className="mt-2 text-muted">{stat.label}</p>
              </div>
            </SectionReveal>
          ))}
        </div>

        <SectionReveal delay={0.4}>
          <div className="mt-12 overflow-hidden rounded-2xl bg-white shadow-sm md:grid md:grid-cols-2">
            <div className="relative h-56 md:h-auto">
              <Image
                src="/austria.png"
                alt="Österreich als Vorbild für Energy Sharing"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-8 md:p-12">
              <blockquote className="font-serif text-xl leading-snug text-primary-dark md:text-2xl">
                „Was in Österreich funktioniert, funktioniert auch bei uns — wir wollen Niedenstein zu einem der ersten Orte in Nordhessen machen."
              </blockquote>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
