"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { producerSchema, type ProducerInput } from "@/lib/validation";

import { OrtsteilSelect } from "./OrtsteilSelect";
import { SuccessCard } from "./SuccessCard";
import {
  errorClass,
  inputClass,
  labelClass,
  submitClass,
  textareaClass,
} from "./formStyles";

type FormValues = ProducerInput;

export function ProducerForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(producerSchema),
    defaultValues: {
      role: "produzent",
      firstName: "",
      lastName: "",
      email: "",
      ortsteil: undefined,
      systemSizeKwp: 10,
      smartMeter: undefined,
      notes: "",
      privacyConsent: undefined,
    },
  });

  const systemSize = watch("systemSizeKwp");

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
          <label htmlFor="p-firstName" className={labelClass}>
            Vorname
          </label>
          <input id="p-firstName" {...register("firstName")} className={inputClass} autoComplete="given-name" />
          {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
        </div>
        <div>
          <label htmlFor="p-lastName" className={labelClass}>
            Nachname
          </label>
          <input id="p-lastName" {...register("lastName")} className={inputClass} autoComplete="family-name" />
          {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="p-email" className={labelClass}>
          E-Mail-Adresse
        </label>
        <input id="p-email" type="email" {...register("email")} className={inputClass} autoComplete="email" />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="p-ortsteil" className={labelClass}>
          Ortsteil
        </label>
        <OrtsteilSelect id="p-ortsteil" {...register("ortsteil")} />
        {errors.ortsteil && <p className={errorClass}>{errors.ortsteil.message}</p>}
      </div>

      <div>
        <label htmlFor="p-size" className={labelClass}>
          Anlagengröße: <span className="text-primary">{systemSize >= 30 ? "30+ kWp" : `${systemSize} kWp`}</span>
        </label>
        <input
          id="p-size"
          type="range"
          min={1}
          max={30}
          step={1}
          {...register("systemSizeKwp", { valueAsNumber: true })}
          className="mt-2 w-full accent-primary"
        />
        <div className="mt-1 flex justify-between text-xs text-muted">
          <span>1 kWp</span>
          <span>30+ kWp</span>
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>Bereits Smart Meter vorhanden?</legend>
        <div className="mt-2 flex flex-wrap gap-4">
          {[
            { value: "ja", label: "Ja" },
            { value: "nein", label: "Nein" },
            { value: "weiss_nicht", label: "Weiß nicht" },
          ].map((opt) => (
            <label key={opt.value} className="inline-flex items-center gap-2 text-base">
              <input
                type="radio"
                value={opt.value}
                {...register("smartMeter")}
                className="h-5 w-5 accent-primary"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {errors.smartMeter && <p className={errorClass}>{errors.smartMeter.message}</p>}
      </fieldset>

      <div>
        <label htmlFor="p-notes" className={labelClass}>
          Anmerkungen oder Fragen (optional)
        </label>
        <textarea id="p-notes" rows={4} {...register("notes")} className={textareaClass} />
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
