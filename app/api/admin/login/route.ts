import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { isAdminEmail } from "@/lib/admin-store";
import { sendMagicLinkEmail } from "@/lib/admin-email";
import { getClientIpFromRequest } from "@/lib/client-ip";
import { signToken } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ email: z.email().max(254) });

function getBaseUrl(req: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  const ip = getClientIpFromRequest(req);
  const limit = checkRateLimit(`admin-login:${ip}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: "Zu viele Anfragen." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Ungültiges JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ success: true }); // no enumeration
  }

  const email = parsed.data.email.trim().toLowerCase();
  if (isAdminEmail(email)) {
    const token = signToken({ purpose: "login", email }, 10 * 60 * 1000);
    const url = `${getBaseUrl(req)}/api/admin/verify?token=${encodeURIComponent(token)}`;
    try {
      await sendMagicLinkEmail(email, url);
    } catch (err) {
      console.error("[admin/login] magic link email failed", err);
    }
  }

  return NextResponse.json({ success: true });
}
