import { getDb } from "./db";

const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

export type AccessLogEntry = {
  id: number;
  email: string;
  action: string;
  ip: string | null;
  at: number;
};

export function logAdminAccess(email: string, action: string, ip: string | null): void {
  const db = getDb();
  db.prepare("DELETE FROM admin_access_log WHERE at < ?").run(Date.now() - RETENTION_MS);
  db.prepare("INSERT INTO admin_access_log (email, action, ip, at) VALUES (?, ?, ?, ?)").run(
    email.toLowerCase(),
    action,
    ip,
    Date.now(),
  );
}

export function listRecentAccess(limit = 200): AccessLogEntry[] {
  return getDb()
    .prepare("SELECT id, email, action, ip, at FROM admin_access_log ORDER BY at DESC LIMIT ?")
    .all(limit) as AccessLogEntry[];
}
