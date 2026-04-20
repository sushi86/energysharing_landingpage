import Link from "next/link";

import { sendOperatorNotificationEmail } from "@/lib/email";
import {
  deletePendingConfirmation,
  peekPendingConfirmation,
} from "@/lib/pending-confirmations";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

type Result = "ok" | "invalid" | "send-failed";

async function confirm(token: string | undefined): Promise<Result> {
  if (!token) return "invalid";
  const payload = peekPendingConfirmation(token);
  if (!payload) return "invalid";
  try {
    await sendOperatorNotificationEmail(payload);
  } catch (err) {
    console.error("[waitlist/confirm] operator mail failed", err);
    return "send-failed";
  }
  deletePendingConfirmation(token);
  return "ok";
}

export default async function ConfirmPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const result = await confirm(token);

  return (
    <main className="bg-primary-pale/40 px-6 py-24">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 shadow-sm ring-1 ring-primary-dark/10">
        {result === "ok" && (
          <>
            <div className="mb-4 text-4xl" aria-hidden>
              ✓
            </div>
            <h1 className="font-serif">Bestätigt — du bist dabei.</h1>
            <p className="mt-4 text-lg text-primary-dark/85">
              Danke! Wir haben deine Eintragung jetzt verbucht. Du bekommst keine Spam-Mails — wir
              melden uns nur, wenn es wirklich etwas zu berichten gibt.
            </p>
          </>
        )}

        {result === "invalid" && (
          <>
            <div className="mb-4 text-4xl" aria-hidden>
              ⚠️
            </div>
            <h1 className="font-serif">Link ungültig oder abgelaufen</h1>
            <p className="mt-4 text-lg text-primary-dark/85">
              Der Bestätigungslink konnte nicht verwendet werden. Er ist entweder abgelaufen (nach
              24 Stunden) oder wurde bereits eingelöst. Du kannst dich einfach noch einmal auf der
              Warteliste eintragen.
            </p>
            <Link
              href="/#warteliste"
              className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
            >
              Zur Warteliste →
            </Link>
          </>
        )}

        {result === "send-failed" && (
          <>
            <div className="mb-4 text-4xl" aria-hidden>
              ⚠️
            </div>
            <h1 className="font-serif">Das hat gerade nicht geklappt</h1>
            <p className="mt-4 text-lg text-primary-dark/85">
              Deine Bestätigung ist angekommen, aber beim internen Versand gab es einen Fehler. Bitte
              versuche es gleich noch einmal — oder melde dich per E-Mail, falls es weiter hakt.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
