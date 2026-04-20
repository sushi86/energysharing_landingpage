import { NextResponse, type NextRequest } from "next/server";

import { sendConfirmationEmail } from "@/lib/email";
import { createPendingConfirmation } from "@/lib/pending-confirmations";
import { checkRateLimit } from "@/lib/rate-limit";
import { waitlistSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

function getBaseUrl(req: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`waitlist:${ip}`);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "Zu viele Anfragen. Bitte versuche es später noch einmal.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Ungültiges JSON." },
      { status: 400 },
    );
  }

  const parsed = waitlistSchema.safeParse(json);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      {
        success: false,
        error: firstIssue?.message ?? "Eingabe ungültig.",
      },
      { status: 400 },
    );
  }

  const token = createPendingConfirmation(parsed.data);
  const confirmUrl = `${getBaseUrl(req)}/warteliste/bestaetigen?token=${encodeURIComponent(token)}`;

  try {
    await sendConfirmationEmail(parsed.data, confirmUrl);
  } catch (err) {
    console.error("[waitlist] confirmation email failed", err);
    return NextResponse.json(
      {
        success: false,
        error: "Versand fehlgeschlagen. Bitte versuche es später noch einmal.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true });
}
