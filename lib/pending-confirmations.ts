import { randomBytes } from "node:crypto";

import type { WaitlistInput } from "./validation";

const TTL_MS = 24 * 60 * 60 * 1000;

type Entry = { payload: WaitlistInput; expiresAt: number };

const store = new Map<string, Entry>();

function sweep(now: number) {
  for (const [token, entry] of store) {
    if (entry.expiresAt <= now) store.delete(token);
  }
}

export function createPendingConfirmation(payload: WaitlistInput): string {
  const now = Date.now();
  sweep(now);
  const token = randomBytes(32).toString("base64url");
  store.set(token, { payload, expiresAt: now + TTL_MS });
  return token;
}

export function peekPendingConfirmation(token: string): WaitlistInput | null {
  const now = Date.now();
  sweep(now);
  const entry = store.get(token);
  if (!entry || entry.expiresAt <= now) return null;
  return entry.payload;
}

export function deletePendingConfirmation(token: string): void {
  store.delete(token);
}

export function _resetPendingConfirmationsForTests() {
  store.clear();
}
