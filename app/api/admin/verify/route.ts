import { NextResponse, type NextRequest } from "next/server";

import { activateAdmin, isAdminEmail } from "@/lib/admin-store";
import { logAdminAccess } from "@/lib/admin-access-log";
import { createSession } from "@/lib/admin-session";
import { getClientIpFromRequest } from "@/lib/client-ip";
import { tryConsumeToken } from "@/lib/consumed-tokens";
import { verifyToken } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/admin?error=invalid", req.url));
  }
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/admin?error=invalid", req.url));
  }

  const email = payload.email.toLowerCase();
  if (!isAdminEmail(email)) {
    return NextResponse.redirect(new URL("/admin?error=invalid", req.url));
  }

  if (!tryConsumeToken(payload.jti, payload.expiresAt)) {
    return NextResponse.redirect(new URL("/admin?error=used", req.url));
  }

  if (payload.purpose === "invite") {
    activateAdmin(email);
  }

  await createSession(email);
  logAdminAccess(email, "login", getClientIpFromRequest(req));

  return NextResponse.redirect(new URL("/admin", req.url));
}
