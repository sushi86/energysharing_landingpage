"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { consumerSchema, type ConsumerInput } from "@/lib/validation";

import { OrtsteilSelect } from "./OrtsteilSelect";
import { SuccessCard } from "./SuccessCard";
import {
  errorClass,
  inputClass,
  labelClass,
  submitClass,
  textareaClass,
} from "./formStyles";

type FormValues = ConsumerInput;

export function ConsumerForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(consumerSchema),
    defaultValues: {
      role: "verbraucher",
      firstName: "",
      lastName: "",
      email: "",
      ortsteil: undefined,
      hasEv: false,
      hasHeatPump: false,
      yearlyConsumptionKwh: 4000,
      notes: "",
      privacyConsent: undefined,
    },
  });

  const consumption = watch("yearlyConsumptionKwh");

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSubmitError(data.error ?? "Etwas ist schiefgegangen. Bitte versuche es erneut.");
        return;
      }
      setSuccess(true);
    } catch {
      setSubmitError("Verbindungsfehler. Bitte versuche es erneut.");
    }
  };

  if (success) return <SuccessCard />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <input type="hidden" {...register("role")} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-firstName" className={labelClass}>
            Vorname
          </label>
          <input id="c-firstName" {...register("firstName")} className={inputClass} autoComplete="given-name" />
          {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
        </div>
        <div>
          <label htmlFor="c-lastName" className={labelClass}>
            Nachname
          </label>
          <input id="c-lastName" {...register("lastName")} className={inputClass} autoComplete="family-name" />
          {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="c-email" className={labelClass}>
          E-Mail-Adresse
        </label>
        <input id="c-email" type="email" {...register("email")} className={inputClass} autoComplete="email" />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="c-ortsteil" className={labelClass}>
          Ortsteil
        </label>
        <OrtsteilSelect id="c-ortsteil" {...register("ortsteil")} />
        {errors.ortsteil && <p className={errorClass}>{errors.ortsteil.message}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 ring-1 ring-primary-dark/20">
          <input type="checkbox" {...register("hasEv")} className="h-5 w-5 accent-primary" />
          <span>E-Auto vorhanden</span>
        </label>
        <label className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 ring-1 ring-primary-dark/20">
          <input type="checkbox" {...register("hasHeatPump")} className="h-5 w-5 accent-primary" />
          <span>Wärmepumpe vorhanden</span>
        </label>
      </div>

      <div>
        <label htmlFor="c-consumption" className={labelClass}>
          Jahresverbrauch:{" "}
          <span className="text-primary">ca. {consumption?.toLocaleString("de-DE")} kWh</span>
        </label>
        <input
          id="c-consumption"
          type="range"
          min={1000}
          max={8000}
          step={100}
          {...register("yearlyConsumptionKwh", { valueAsNumber: true })}
          className="mt-2 w-full accent-primary"
        />
        <div className="mt-1 flex justify-between text-xs text-muted">
          <span>1.000 kWh</span>
          <span>8.000 kWh</span>
        </div>
        <p className="mt-1 text-xs text-muted">Durchschnittlicher 4-Personen-Haushalt: ~4.000 kWh</p>
      </div>

      <div>
        <label htmlFor="c-notes" className={labelClass}>
          Anmerkungen oder Fragen (optional)
        </label>
        <textarea id="c-notes" rows={4} {...register("notes")} className={textareaClass} />
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          {...register("privacyConsent")}
          className="mt-1 h-5 w-5 accent-primary"
        />
        <span>
          Ich habe die{" "}
          <a href="/datenschutz" className="underline hover:text-primary" target="_blank" rel="noreferrer">
            Datenschutzerklärung
          </a>{" "}
          gelesen und stimme der Verarbeitung meiner Daten zu.
        </span>
      </label>
      {errors.privacyConsent && <p className={errorClass}>{errors.privacyConsent.message}</p>}

      {submitError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800 ring-1 ring-red-200">{submitError}</p>
      )}

      <button type="submit" disabled={isSubmitting} className={submitClass}>
        {isSubmitting ? "Wird gesendet …" : "Auf Warteliste eintragen →"}
      </button>
    </form>
  );
}
