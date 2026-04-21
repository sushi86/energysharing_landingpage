import { randomBytes } from "node:crypto";

import { decryptField, encryptField } from "./crypto";
import { getDb } from "./db";
import type { WaitlistInput } from "./validation";

const TTL_MS = 24 * 60 * 60 * 1000;

function sweep(now: number): void {
  getDb().prepare("DELETE FROM pending_confirmations WHERE expires_at <= ?").run(now);
}

export function createPendingConfirmation(payload: WaitlistInput): string {
  const now = Date.now();
  sweep(now);
  const token = randomBytes(32).toString("base64url");
  getDb()
    .prepare("INSERT INTO pending_confirmations (token, payload_enc, expires_at) VALUES (?, ?, ?)")
    .run(token, encryptField(JSON.stringify(payload)), now + TTL_MS);
  return token;
}

export function peekPendingConfirmation(token: string): WaitlistInput | null {
  const now = Date.now();
  sweep(now);
  const row = getDb()
    .prepare("SELECT payload_enc, expires_at FROM pending_confirmations WHERE token = ?")
    .get(token) as { payload_enc: string; expires_at: number } | undefined;
  if (!row || row.expires_at <= now) return null;
  return JSON.parse(decryptField(row.payload_enc)) as WaitlistInput;
}

export function deletePendingConfirmation(token: string): void {
  getDb().prepare("DELETE FROM pending_confirmations WHERE token = ?").run(token);
}
