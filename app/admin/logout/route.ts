import { NextResponse, type NextRequest } from "next/server";

import { logAdminAccess } from "@/lib/admin-access-log";
import { destroySession, getSessionEmail } from "@/lib/admin-session";

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

export async function POST(req: NextRequest) {
  const email = await getSessionEmail();
  if (email) {
    logAdminAccess(email, "logout", getClientIp(req));
  }
  await destroySession();
  return NextResponse.redirect(new URL("/admin", req.url), 303);
}
