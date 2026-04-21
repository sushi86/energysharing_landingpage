import { cookies } from "next/headers";

import { generateSessionId } from "./crypto";
import { getDb } from "./db";
import { isActiveAdmin } from "./admin-store";

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const COOKIE_NAME = "esl_admin_session";

export async function createSession(email: string): Promise<void> {
  const id = generateSessionId();
  const now = Date.now();
  getDb()
    .prepare("INSERT INTO admin_sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .run(id, email.toLowerCase(), now, now + SESSION_TTL_MS);
  const store = await cookies();
  store.set(COOKIE_NAME, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function getSessionEmail(): Promise<string | null> {
  const store = await cookies();
  const id = store.get("esl_admin_session")?.value;
  if (!id) return null;
  const row = getDb()
    .prepare("SELECT email, expires_at FROM admin_sessions WHERE id = ?")
    .get(id) as { email: string; expires_at: number } | undefined;
  if (!row || row.expires_at <= Date.now()) return null;
  if (!isActiveAdmin(row.email)) return null;
  return row.email;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const id = store.get("esl_admin_session")?.value;
  if (id) {
    getDb().prepare("DELETE FROM admin_sessions WHERE id = ?").run(id);
  }
  store.delete("esl_admin_session");
}

export function sweepExpiredSessions(): void {
  getDb().prepare("DELETE FROM admin_sessions WHERE expires_at <= ?").run(Date.now());
}
