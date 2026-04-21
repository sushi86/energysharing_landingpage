import { NextResponse, type NextRequest } from "next/server";

import { activateAdmin, isAdminEmail } from "@/lib/admin-store";
import { logAdminAccess } from "@/lib/admin-access-log";
import { createSession } from "@/lib/admin-session";
import { verifyToken } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() ?? "unknown";
}

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

  if (payload.purpose === "invite") {
    activateAdmin(email);
  }

  await createSession(email);
  logAdminAccess(email, "login", getClientIp(req));

  return NextResponse.redirect(new URL("/admin", req.url));
}
