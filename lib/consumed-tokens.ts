import { getDb } from "./db";

export function tryConsumeToken(jti: string, expiresAt: number): boolean {
  const db = getDb();
  db.prepare("DELETE FROM consumed_tokens WHERE expires_at <= ?").run(Date.now());
  const result = db
    .prepare("INSERT OR IGNORE INTO consumed_tokens (jti, expires_at) VALUES (?, ?)")
    .run(jti, expiresAt);
  return result.changes === 1;
}
