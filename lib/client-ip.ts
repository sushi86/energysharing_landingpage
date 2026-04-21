import { headers } from "next/headers";
import type { NextRequest } from "next/server";

function pickIp(forwardedFor: string | null, realIp: string | null): string {
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  return realIp?.trim() ?? "unknown";
}

export function getClientIpFromRequest(req: NextRequest): string {
  return pickIp(req.headers.get("x-forwarded-for"), req.headers.get("x-real-ip"));
}

export async function getClientIpFromHeaders(): Promise<string> {
  const h = await headers();
  return pickIp(h.get("x-forwarded-for"), h.get("x-real-ip"));
}
