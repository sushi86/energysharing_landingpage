import { logAdminAccess } from "@/lib/admin-access-log";
import { getSessionEmail } from "@/lib/admin-session";
import { listWaitlistEntries } from "@/lib/waitlist-store";

export const dynamic = "force-dynamic";

function formatDate(ms: number): string {
  return new Date(ms).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" });
}

export default async function AdminWaitlistPage() {
  const email = await getSessionEmail();
  if (!email) return null;
  const entries = listWaitlistEntries();
  logAdminAccess(email, "view-list", null);
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Warteliste</h1>
        <a
          href="/admin/warteliste/export?confirm=1"
          className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          CSV exportieren
        </a>
      </div>
      <p className="mt-2 text-sm text-primary-dark/70">{entries.length} Einträge</p>
      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-primary-dark/10">
        <table className="min-w-full text-sm">
          <thead className="bg-primary-pale/60 text-left">
            <tr>
              <th className="px-3 py-2">Bestätigt</th>
              <th className="px-3 py-2">Rolle</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">E-Mail</th>
              <th className="px-3 py-2">Ortsteil</th>
              <th className="px-3 py-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-t border-primary-dark/5">
                <td className="px-3 py-2 whitespace-nowrap">{formatDate(e.confirmedAt)}</td>
                <td className="px-3 py-2">{e.role}</td>
                <td className="px-3 py-2">{e.firstName} {e.lastName}</td>
                <td className="px-3 py-2"><a className="underline" href={`mailto:${e.email}`}>{e.email}</a></td>
                <td className="px-3 py-2">{e.ortsteil}</td>
                <td className="px-3 py-2 text-primary-dark/80">
                  {e.role === "produzent"
                    ? `${e.producerSystemSizeKwp} kWp · Smart Meter: ${e.producerSmartMeter}`
                    : `${e.consumerYearlyKwh} kWh/a · EV: ${e.consumerHasEv ? "ja" : "nein"} · WP: ${e.consumerHasHeatPump ? "ja" : "nein"}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
