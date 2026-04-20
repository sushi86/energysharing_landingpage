"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden">
      <Image
        src="/hero.jpg"
        alt="Blick auf Niedenstein und das Chattengau"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/70 via-primary-dark/55 to-primary-dark/75" />

      <div className="relative mx-auto flex min-h-[90vh] max-w-content flex-col justify-center px-6 py-24 text-white md:py-32">
        <div className="mb-8">
          <Badge>Pilotprojekt Chattengau · 2026</Badge>
        </div>

        <h1 className="font-serif text-white">
          Sonnenstrom aus der Nachbarschaft.
        </h1>

        <div className="mt-8 grid gap-4 text-lg md:grid-cols-2 md:text-xl">
          <p className="flex items-start gap-3">
            <span aria-hidden className="text-2xl">☀️</span>
            <span>
              <strong>Mit PV-Anlage:</strong> mehr Erlös als bisher — dein Strom bleibt im Ort.
            </span>
          </p>
          <p className="flex items-start gap-3">
            <span aria-hidden className="text-2xl">⚡</span>
            <span>
              <strong>Ohne PV-Anlage:</strong> günstigerer Strom direkt vom Nachbarn.
            </span>
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="#warteliste?role=producer"
            className="inline-flex min-h-[52px] items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary-light/60"
          >
            Ich habe eine Solaranlage →
          </Link>
          <Link
            href="#warteliste?role=consumer"
            className="inline-flex min-h-[52px] items-center justify-center rounded-lg bg-primary-light px-6 py-3 text-base font-semibold text-primary-dark shadow-lg transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-primary-pale/80"
          >
            Ich möchte günstigeren Strom →
          </Link>
        </div>

        <p className="mt-6 max-w-xl text-sm text-white/85">
          Keine Kündigung deines Stromvertrags nötig — Energy Sharing kommt einfach dazu.
        </p>
      </div>
    </section>
  );
}
