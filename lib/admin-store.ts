import { getDb } from "./db";

export type AdminRow = {
  email: string;
  status: "active" | "invited";
  invitedBy: string | null;
  createdAt: number;
};

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

export function listAdmins(): AdminRow[] {
  const rows = getDb()
    .prepare("SELECT email, status, invited_by AS invitedBy, created_at AS createdAt FROM admins ORDER BY created_at ASC")
    .all() as AdminRow[];
  return rows;
}

export function isAdminEmail(email: string): boolean {
  const row = getDb()
    .prepare("SELECT status FROM admins WHERE email = ?")
    .get(normalize(email)) as { status: string } | undefined;
  return !!row;
}

export function isActiveAdmin(email: string): boolean {
  const row = getDb()
    .prepare("SELECT status FROM admins WHERE email = ?")
    .get(normalize(email)) as { status: string } | undefined;
  return row?.status === "active";
}

export function addAdmin(email: string, invitedBy: string): void {
  getDb()
    .prepare(
      "INSERT OR IGNORE INTO admins (email, status, invited_by, created_at) VALUES (?, 'invited', ?, ?)",
    )
    .run(normalize(email), normalize(invitedBy), Date.now());
}

export function activateAdmin(email: string): void {
  getDb()
    .prepare("UPDATE admins SET status = 'active' WHERE email = ?")
    .run(normalize(email));
}

export function removeAdmin(email: string): void {
  const e = normalize(email);
  const db = getDb();
  db.prepare("DELETE FROM admins WHERE email = ?").run(e);
  db.prepare("DELETE FROM admin_sessions WHERE email = ?").run(e);
}
