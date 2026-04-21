import { NextResponse, type NextRequest } from "next/server";

import { logAdminAccess } from "@/lib/admin-access-log";
import { destroySession, getSessionEmail } from "@/lib/admin-session";
import { getClientIpFromRequest } from "@/lib/client-ip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const email = await getSessionEmail();
  if (email) {
    logAdminAccess(email, "logout", getClientIpFromRequest(req));
  }
  await destroySession();
  return NextResponse.redirect(new URL("/admin", req.url), 303);
}
