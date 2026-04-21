import { NextResponse, type NextRequest } from "next/server";

import { logAdminAccess } from "@/lib/admin-access-log";
import { getSessionEmail } from "@/lib/admin-session";
import { getClientIpFromRequest } from "@/lib/client-ip";
import { listWaitlistEntries } from "@/lib/waitlist-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(value: string | number | boolean | null): string {
  if (value === null || value === undefined) return "";
  // Defuse CSV formula injection: cells starting with =, +, -, @, tab, or CR
  // are executed as formulas by Excel/LibreOffice/Numbers when the file is opened.
  // Prefix a single quote so the spreadsheet treats them as literal text.
  const s = String(value).replace(/^[=+\-@\t\r]/, "'$&");
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  if (req.nextUrl.searchParams.get("confirm") !== "1") {
    return NextResponse.redirect(new URL("/admin/warteliste", req.url));
  }

  const entries = listWaitlistEntries();
  logAdminAccess(email, `export-csv:${entries.length}`, getClientIpFromRequest(req));

  const header = [
    "confirmed_at",
    "role",
    "first_name",
    "last_name",
    "email",
    "ortsteil",
    "notes",
    "producer_system_size_kwp",
    "producer_smart_meter",
    "consumer_has_ev",
    "consumer_has_heat_pump",
    "consumer_yearly_kwh",
  ];
  const lines = [header.join(",")];
  for (const e of entries) {
    lines.push(
      [
        new Date(e.confirmedAt).toISOString(),
        e.role,
        e.firstName,
        e.lastName,
        e.email,
        e.ortsteil,
        e.notes ?? "",
        e.producerSystemSizeKwp ?? "",
        e.producerSmartMeter ?? "",
        e.consumerHasEv === null ? "" : e.consumerHasEv ? "ja" : "nein",
        e.consumerHasHeatPump === null ? "" : e.consumerHasHeatPump ? "ja" : "nein",
        e.consumerYearlyKwh ?? "",
      ]
        .map(csvEscape)
        .join(","),
    );
  }
  const body = "﻿" + lines.join("\r\n") + "\r\n";

  const filename = `warteliste-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
