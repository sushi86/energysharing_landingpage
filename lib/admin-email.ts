import { Resend } from "resend";

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.WAITLIST_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error("Resend-Konfiguration fehlt (RESEND_API_KEY / WAITLIST_FROM_EMAIL).");
  }
  return { apiKey, from };
}

export async function sendMagicLinkEmail(toEmail: string, url: string): Promise<void> {
  const { apiKey, from } = getResendConfig();
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: toEmail,
    subject: "Dein Login-Link — Energy Sharing Admin",
    text: [
      "Hallo,",
      "",
      "hier ist dein Login-Link für den Admin-Bereich. Er ist 10 Minuten gültig und nur einmal nutzbar:",
      "",
      url,
      "",
      "Wenn du diesen Link nicht angefordert hast, kannst du diese Mail ignorieren.",
    ].join("\n"),
  });
  if (error) throw new Error(`Resend-Fehler: ${error.message ?? "unbekannt"}`);
}

export async function sendAdminInviteEmail(
  toEmail: string,
  inviterEmail: string,
  url: string,
): Promise<void> {
  const { apiKey, from } = getResendConfig();
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: toEmail,
    subject: "Einladung zum Admin-Bereich — Energy Sharing",
    text: [
      "Hallo,",
      "",
      `${inviterEmail} hat dich zum Admin-Bereich der Warteliste eingeladen.`,
      "Klicke auf den folgenden Link, um deinen Zugang zu aktivieren und dich einzuloggen. Der Link ist 24 Stunden gültig:",
      "",
      url,
      "",
      "Wenn du diesen Link nicht erwartet hast, kannst du diese Mail ignorieren.",
    ].join("\n"),
  });
  if (error) throw new Error(`Resend-Fehler: ${error.message ?? "unbekannt"}`);
}
