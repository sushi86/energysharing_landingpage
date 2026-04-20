import { Resend } from "resend";

import type { WaitlistInput } from "./validation";

const SMART_METER_LABEL: Record<string, string> = {
  ja: "Ja",
  nein: "Nein",
  weiss_nicht: "Weiß nicht",
};

function formatSystemSize(kwp: number): string {
  return kwp >= 30 ? "30+ kWp" : `${kwp} kWp`;
}

function formatFields(data: WaitlistInput): string {
  const lines: string[] = [
    `Rolle: ${data.role === "produzent" ? "Produzent (mit Solaranlage)" : "Verbraucher (ohne Solaranlage)"}`,
    `Name: ${data.firstName} ${data.lastName}`,
    `E-Mail: ${data.email}`,
    `Ortsteil: ${data.ortsteil}`,
  ];

  if (data.role === "produzent") {
    lines.push(
      `Anlagengröße: ${formatSystemSize(data.systemSizeKwp)}`,
      `Smart Meter vorhanden: ${SMART_METER_LABEL[data.smartMeter] ?? data.smartMeter}`,
    );
  } else {
    lines.push(
      `E-Auto: ${data.hasEv ? "Ja" : "Nein"}`,
      `Wärmepumpe: ${data.hasHeatPump ? "Ja" : "Nein"}`,
      `Jahresverbrauch: ca. ${data.yearlyConsumptionKwh.toLocaleString("de-DE")} kWh`,
    );
  }

  if (data.notes && data.notes.trim().length > 0) {
    lines.push("", "Anmerkungen:", data.notes.trim());
  }

  return lines.join("\n");
}

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.WAITLIST_TO_EMAIL;
  const from = process.env.WAITLIST_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    throw new Error("Resend-Konfiguration fehlt (RESEND_API_KEY / WAITLIST_TO_EMAIL / WAITLIST_FROM_EMAIL).");
  }
  return { apiKey, to, from };
}

export async function sendConfirmationEmail(data: WaitlistInput, confirmUrl: string): Promise<void> {
  const { apiKey, from } = getResendConfig();

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: data.email,
    subject: "Bitte bestätige deine Eintragung — Energy Sharing Chattengau",
    text: [
      `Hallo ${data.firstName},`,
      "",
      "danke für dein Interesse am Energy-Sharing-Pilotprojekt im Chattengau.",
      "",
      "Damit wir sicher sind, dass du die Eintragung wirklich vorgenommen hast,",
      "bestätige sie bitte über diesen Link:",
      "",
      confirmUrl,
      "",
      "Der Link ist 24 Stunden gültig. Wenn du die Eintragung nicht vorgenommen hast,",
      "kannst du diese Mail einfach ignorieren — es passiert dann nichts weiter.",
      "",
      "Viele Grüße",
      "Sascha Märkl",
    ].join("\n"),
  });

  if (error) {
    throw new Error(`Resend-Fehler: ${error.message ?? "unbekannt"}`);
  }
}

export async function sendOperatorNotificationEmail(data: WaitlistInput): Promise<void> {
  const { apiKey, to, from } = getResendConfig();

  const roleLabel = data.role === "produzent" ? "Produzent" : "Verbraucher";
  const subject = `Neue Wartelisten-Eintragung: ${roleLabel} aus ${data.ortsteil}`;
  const body = formatFields(data);

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: data.email,
    subject,
    text: body,
  });

  if (error) {
    throw new Error(`Resend-Fehler: ${error.message ?? "unbekannt"}`);
  }
}
