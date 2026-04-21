import { listRecentAccess, logAdminAccess } from "@/lib/admin-access-log";
import { getSessionEmail } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

function formatDate(ms: number): string {
  return new Date(ms).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "medium" });
}

export default async function AccessLogPage() {
  const email = await getSessionEmail();
  if (!email) return null;
  const entries = listRecentAccess(200);
  logAdminAccess(email, "view-access-log", null);
  return (
    <div>
      <h1 className="font-serif text-3xl">Zugriffsprotokoll</h1>
      <p className="mt-2 text-sm text-primary-dark/70">
        Die letzten 200 Einträge. Einträge älter als 90 Tage werden automatisch gelöscht.
      </p>
      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-primary-dark/10">
        <table className="min-w-full text-sm">
          <thead className="bg-primary-pale/60 text-left">
            <tr>
              <th className="px-3 py-2">Zeit</th>
              <th className="px-3 py-2">E-Mail</th>
              <th className="px-3 py-2">Aktion</th>
              <th className="px-3 py-2">IP</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-t border-primary-dark/5">
                <td className="px-3 py-2 whitespace-nowrap">{formatDate(e.at)}</td>
                <td className="px-3 py-2">{e.email}</td>
                <td className="px-3 py-2">{e.action}</td>
                <td className="px-3 py-2">{e.ip ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
