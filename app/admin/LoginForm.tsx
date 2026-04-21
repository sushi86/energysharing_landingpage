"use client";

import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-24 max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-primary-dark/10">
      <h1 className="font-serif text-2xl">Admin-Login</h1>
      <p className="mt-2 text-sm text-primary-dark/70">
        Gib deine E-Mail-Adresse ein — wir schicken dir einen einmal gültigen Login-Link.
      </p>
      <label className="mt-6 block text-sm font-medium">E-Mail</label>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-1 block w-full rounded-md border border-primary-dark/20 px-3 py-2"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {state === "sending" ? "Sende..." : "Login-Link senden"}
      </button>
      {state === "sent" && (
        <p className="mt-4 text-sm text-primary-dark/80">
          Falls die Adresse berechtigt ist, ist jetzt eine Mail mit Login-Link unterwegs.
        </p>
      )}
      {state === "error" && (
        <p className="mt-4 text-sm text-red-600">Das hat gerade nicht geklappt. Bitte nochmal versuchen.</p>
      )}
    </form>
  );
}
