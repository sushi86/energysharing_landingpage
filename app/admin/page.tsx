import Link from "next/link";

import { logAdminAccess } from "@/lib/admin-access-log";
import { getSessionEmail } from "@/lib/admin-session";
import { countWaitlistEntries } from "@/lib/waitlist-store";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const email = await getSessionEmail();
  if (!email) return null; // layout already shows login form
  const count = countWaitlistEntries();
  logAdminAccess(email, "view-home", null);
  return (
    <div>
      <h1 className="font-serif text-3xl">Übersicht</h1>
      <p className="mt-6 text-lg">Bestätigte Einträge: <strong>{count}</strong></p>
      <ul className="mt-8 space-y-2 text-sm">
        <li><Link className="underline" href="/admin/warteliste">→ Warteliste ansehen</Link></li>
        <li><Link className="underline" href="/admin/admins">→ Admins verwalten</Link></li>
        <li><Link className="underline" href="/admin/zugriffsprotokoll">→ Zugriffsprotokoll</Link></li>
      </ul>
    </div>
  );
}
