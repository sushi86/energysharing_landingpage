import { logAdminAccess } from "@/lib/admin-access-log";
import { listAdmins } from "@/lib/admin-store";
import { getSessionEmail } from "@/lib/admin-session";

import { inviteAdmin, removeAdminAction } from "./actions";

export const dynamic = "force-dynamic";

function formatDate(ms: number): string {
  return new Date(ms).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" });
}

export default async function AdminsPage() {
  const email = await getSessionEmail();
  if (!email) return null;
  const admins = listAdmins();
  logAdminAccess(email, "view-admins", null);

  return (
    <div>
      <h1 className="font-serif text-3xl">Admins</h1>
      <form action={inviteAdmin} className="mt-6 flex gap-3">
        <input
          name="email"
          type="email"
          required
          placeholder="neue-adresse@example.de"
          className="flex-1 rounded-md border border-primary-dark/20 px-3 py-2"
        />
        <button
          type="submit"
          className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-dark"
        >
          Einladen
        </button>
      </form>

      <table className="mt-8 min-w-full rounded-xl bg-white text-sm shadow-sm ring-1 ring-primary-dark/10">
        <thead className="bg-primary-pale/60 text-left">
          <tr>
            <th className="px-3 py-2">E-Mail</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Eingeladen von</th>
            <th className="px-3 py-2">Angelegt</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {admins.map((a) => (
            <tr key={a.email} className="border-t border-primary-dark/5">
              <td className="px-3 py-2">{a.email}</td>
              <td className="px-3 py-2">{a.status === "active" ? "aktiv" : "eingeladen"}</td>
              <td className="px-3 py-2">{a.invitedBy ?? "—"}</td>
              <td className="px-3 py-2">{formatDate(a.createdAt)}</td>
              <td className="px-3 py-2">
                {a.email !== email && (
                  <form action={removeAdminAction}>
                    <input type="hidden" name="email" value={a.email} />
                    <button type="submit" className="text-sm text-red-700 underline">entfernen</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
