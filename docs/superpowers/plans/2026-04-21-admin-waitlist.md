# Admin Waitlist (SQLite + Magic-Link + Field Encryption) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist double-opt-in-confirmed waitlist entries in an encrypted SQLite database, make them viewable and CSV-exportable via a magic-link-protected `/admin` area, and allow admins to manage the admin allowlist from the UI without a redeploy.

**Architecture:** A single SQLite database file mounted on a docker volume holds five tables: `waitlist_entries`, `pending_confirmations`, `admins`, `admin_sessions`, `admin_access_log`. PII columns in `waitlist_entries` are encrypted at rest with AES-256-GCM (key from env). Admin auth is passwordless via signed magic-link tokens emailed to addresses listed in the `admins` table; sessions are HttpOnly, Secure, SameSite=Strict cookies. A bootstrap admin email is seeded from env on first start; further admins are added through the admin UI (via magic-link invitation). The existing confirmation email flow (`sendConfirmationEmail` → user clicks link → `sendOperatorNotificationEmail`) is preserved; on confirmation we additionally insert an encrypted row. Access to the admin area is rate-limited, logged, and protected with strict security headers configured in `next.config.ts`. Access-log entries older than 90 days are pruned on each write.

**Tech Stack:** Next.js 16 (App Router, Route Handlers, Server Components), better-sqlite3 (synchronous, native), Node.js `node:crypto` for AES-256-GCM + HMAC token signing, Resend (existing) for magic-link and invitation mails, Zod (existing) for input validation, Node.js built-in test runner (`node --test`) for crypto unit tests.

---

## File Structure

**New files:**
- `lib/db.ts` — opens SQLite connection, runs migrations idempotently, exports singleton `getDb()`.
- `lib/crypto.ts` — `encryptField(plaintext) → string`, `decryptField(ciphertext) → string`, `signToken(payload, ttlMs)`, `verifyToken(token)`, `generateSessionId()`.
- `lib/crypto.test.ts` — `node --test` unit tests for round-trip, tampering detection, TTL expiry.
- `lib/waitlist-store.ts` — `insertWaitlistEntry(payload)`, `listWaitlistEntries()`, `countWaitlistEntries()`. Encrypts on write, decrypts on read.
- `lib/pending-confirmations-store.ts` — replacement for in-memory `pending-confirmations.ts`: persists pending tokens in SQLite, sweeps expired on every call.
- `lib/admin-store.ts` — `listAdmins()`, `addAdmin(email, invitedBy)`, `removeAdmin(email)`, `isAdminEmail(email)`, `activateAdmin(email)`.
- `lib/admin-session.ts` — `createSession(email) → sessionId`, `getSessionFromCookies() → email | null`, `destroySession(sessionId)`. Session lookup verifies expiry + that email still exists in `admins`.
- `lib/admin-access-log.ts` — `logAdminAccess(email, action, ip)`, `listRecentAccess(limit)`, `pruneAccessLogOlderThan90Days()`. Called from admin routes.
- `lib/admin-email.ts` — `sendMagicLinkEmail(email, url)`, `sendAdminInviteEmail(email, inviterEmail, url)`. Reuses Resend client.
- `app/admin/layout.tsx` — server component: gate-checks session; unauthenticated visitors see a lightweight login form (no nav, no admin chrome).
- `app/admin/page.tsx` — landing: summary (entry count) + links to waitlist list, admin management, access log.
- `app/admin/warteliste/page.tsx` — table of all confirmed entries. Each row decrypted server-side.
- `app/admin/warteliste/export/route.ts` — GET route handler; returns `text/csv` with `Content-Disposition: attachment`; requires a confirm query param to prevent accidental prefetch export.
- `app/admin/admins/page.tsx` — server component: list admins + "add" form + remove buttons. All actions via server actions.
- `app/admin/admins/actions.ts` — server actions `inviteAdmin(formData)`, `removeAdminAction(formData)`.
- `app/admin/zugriffsprotokoll/page.tsx` — last 200 access-log entries (newest first).
- `app/admin/logout/route.ts` — POST: destroys session cookie.
- `app/api/admin/login/route.ts` — POST: body `{ email }`. If on allowlist, sends magic link. Always returns 200 (no enumeration). Rate-limited.
- `app/api/admin/verify/route.ts` — GET: query `?token=…`. Verifies HMAC, looks up session-invite intent (login vs invitation-activation), creates session cookie, redirects to `/admin`.

**Modified files:**
- `app/api/waitlist/route.ts` — after `createPendingConfirmation`, unchanged. No write to `waitlist_entries` here.
- `app/warteliste/bestaetigen/page.tsx` — after `peekPendingConfirmation` + `sendOperatorNotificationEmail`, additionally call `insertWaitlistEntry(payload)` before `deletePendingConfirmation`.
- `lib/pending-confirmations.ts` — replaced at import sites with `lib/pending-confirmations-store.ts`. The old file is deleted at the end of Task 5.
- `next.config.ts` — add `headers()` with `X-Robots-Tag: noindex`, strict CSP, `Cache-Control: no-store` for `/admin/:path*`; add `serverExternalPackages: ["better-sqlite3"]` so Next doesn't try to bundle the native module.
- `compose.yaml` — add volume mount for SQLite file; add env vars: `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_DATA_KEY`, `ADMIN_SESSION_SECRET`, `ADMIN_DB_PATH`.
- `Dockerfile` — add `python3 make g++` build deps in `deps` stage so `better-sqlite3` compiles; in `runner` stage install runtime sqlite lib and create `/app/data` dir owned by `nextjs`.
- `.env.local.example` — add the four new env vars with placeholder guidance.
- `package.json` — add `better-sqlite3` dep, `@types/better-sqlite3` dev-dep, `test` script running `node --test "lib/**/*.test.ts"` via tsx-free path (see Task 3 for exact script).
- `README.md` — document setup: env vars, key generation command, admin bootstrap, docker volume.

---

## Task 1: Dependencies, Docker Volume, Env Scaffolding

**Files:**
- Modify: `package.json`
- Modify: `Dockerfile`
- Modify: `compose.yaml`
- Modify: `.env.local.example`
- Create: `data/.gitkeep`
- Modify: `.gitignore`

- [ ] **Step 1: Install dependencies**

Run: `npm install better-sqlite3 && npm install -D @types/better-sqlite3 tsx`

`tsx` is needed to run TypeScript-authored `*.test.ts` with Node's built-in test runner.

- [ ] **Step 2: Add test script to `package.json`**

In the `scripts` block of `package.json`, add:

```json
"test": "node --import tsx --test \"lib/**/*.test.ts\""
```

- [ ] **Step 3: Update `Dockerfile` to compile native module and create data dir**

Replace the `deps` stage's `RUN apk add --no-cache libc6-compat` line with:

```dockerfile
RUN apk add --no-cache libc6-compat python3 make g++
```

In the `runner` stage, after the `RUN addgroup … adduser …` block, insert:

```dockerfile
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data
VOLUME /app/data
```

- [ ] **Step 4: Add volume + env vars to `compose.yaml`**

Under `services.web`, add to `environment`:

```yaml
      ADMIN_BOOTSTRAP_EMAIL: ${ADMIN_BOOTSTRAP_EMAIL}
      ADMIN_DATA_KEY: ${ADMIN_DATA_KEY}
      ADMIN_SESSION_SECRET: ${ADMIN_SESSION_SECRET}
      ADMIN_DB_PATH: /app/data/waitlist.db
```

And add a `volumes:` section under the `web` service:

```yaml
    volumes:
      - waitlist_data:/app/data
```

At the bottom of the file, above `networks:`, add:

```yaml
volumes:
  waitlist_data:
```

- [ ] **Step 5: Update `.env.local.example`**

Replace the file contents with:

```
# Copy to .env.local and replace with real values before deploy.
RESEND_API_KEY=[PLATZHALTER]
WAITLIST_TO_EMAIL=[PLATZHALTER]
WAITLIST_FROM_EMAIL=[PLATZHALTER]
# Optional: absolute base URL used in confirmation links (falls back to request host).
NEXT_PUBLIC_SITE_URL=

# Admin waitlist area
# Bootstrap admin email (seeded once on first start if admins table is empty).
ADMIN_BOOTSTRAP_EMAIL=
# 32-byte key for AES-256-GCM field encryption, hex-encoded (64 hex chars).
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ADMIN_DATA_KEY=
# 32-byte secret for HMAC signing of magic-link tokens, hex-encoded.
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ADMIN_SESSION_SECRET=
# SQLite database file path. In dev: ./data/waitlist.db. In prod container: /app/data/waitlist.db.
ADMIN_DB_PATH=./data/waitlist.db
```

- [ ] **Step 6: Ensure local `data/` directory exists but is not committed**

Create `data/.gitkeep` as an empty file.

Append to `.gitignore`:

```
/data/*
!/data/.gitkeep
```

- [ ] **Step 7: Verify install works**

Run: `npm run lint && npx tsc --noEmit`
Expected: both pass.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json Dockerfile compose.yaml .env.local.example .gitignore data/.gitkeep
git commit -m "chore: add sqlite deps, data volume, admin env scaffolding"
```

---

## Task 2: SQLite Connection + Migrations

**Files:**
- Create: `lib/db.ts`

- [ ] **Step 1: Write `lib/db.ts`**

```typescript
import Database, { type Database as DB } from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

let instance: DB | null = null;

function getDbPath(): string {
  const path = process.env.ADMIN_DB_PATH;
  if (!path) throw new Error("ADMIN_DB_PATH ist nicht gesetzt.");
  return path;
}

function runMigrations(db: DB): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS waitlist_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL CHECK (role IN ('produzent','verbraucher')),
      ortsteil TEXT NOT NULL,
      first_name_enc TEXT NOT NULL,
      last_name_enc TEXT NOT NULL,
      email_enc TEXT NOT NULL,
      notes_enc TEXT,
      producer_system_size_kwp INTEGER,
      producer_smart_meter TEXT,
      consumer_has_ev INTEGER,
      consumer_has_heat_pump INTEGER,
      consumer_yearly_kwh INTEGER,
      confirmed_at INTEGER NOT NULL,
      ip TEXT
    );

    CREATE TABLE IF NOT EXISTS pending_confirmations (
      token TEXT PRIMARY KEY,
      payload_enc TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admins (
      email TEXT PRIMARY KEY,
      status TEXT NOT NULL CHECK (status IN ('active','invited')),
      invited_by TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_admin_sessions_email ON admin_sessions(email);

    CREATE TABLE IF NOT EXISTS admin_access_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      action TEXT NOT NULL,
      ip TEXT,
      at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_admin_access_log_at ON admin_access_log(at);
  `);
}

function seedBootstrapAdmin(db: DB): void {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  if (!email) return;
  const row = db.prepare("SELECT COUNT(*) AS c FROM admins").get() as { c: number };
  if (row.c > 0) return;
  db.prepare(
    "INSERT INTO admins (email, status, invited_by, created_at) VALUES (?, 'active', NULL, ?)",
  ).run(email, Date.now());
}

export function getDb(): DB {
  if (instance) return instance;
  const path = getDbPath();
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  runMigrations(db);
  seedBootstrapAdmin(db);
  instance = db;
  return db;
}

export function _resetDbForTests(): void {
  if (instance) {
    instance.close();
    instance = null;
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Smoke-test against a temp DB**

Run:

```bash
ADMIN_DB_PATH=/tmp/test-waitlist.db ADMIN_BOOTSTRAP_EMAIL=dev@maerkl.net node --import tsx -e "import('./lib/db.ts').then(m => { const db = m.getDb(); console.log(db.prepare('SELECT email FROM admins').all()); })"
```

Expected output: `[ { email: 'dev@maerkl.net' } ]`. Then: `rm /tmp/test-waitlist.db*`.

- [ ] **Step 4: Commit**

```bash
git add lib/db.ts
git commit -m "feat(admin): add sqlite db module with migrations and bootstrap admin seed"
```

---

## Task 3: AES-256-GCM Field Crypto + HMAC Tokens

**Files:**
- Create: `lib/crypto.ts`
- Create: `lib/crypto.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/crypto.test.ts`:

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";

process.env.ADMIN_DATA_KEY = "a".repeat(64);
process.env.ADMIN_SESSION_SECRET = "b".repeat(64);

const { encryptField, decryptField, signToken, verifyToken } = await import("./crypto.ts");

test("encryptField → decryptField round-trips", () => {
  const plain = "Hallo Welt — ümläüte";
  const enc = encryptField(plain);
  assert.notEqual(enc, plain);
  assert.equal(decryptField(enc), plain);
});

test("encryptField produces different ciphertext per call (random IV)", () => {
  const a = encryptField("same");
  const b = encryptField("same");
  assert.notEqual(a, b);
  assert.equal(decryptField(a), "same");
  assert.equal(decryptField(b), "same");
});

test("decryptField rejects tampered ciphertext", () => {
  const enc = encryptField("secret");
  const tampered = enc.slice(0, -2) + (enc.endsWith("AA") ? "BB" : "AA");
  assert.throws(() => decryptField(tampered));
});

test("signToken → verifyToken round-trips and carries payload", () => {
  const token = signToken({ purpose: "login", email: "x@y.z" }, 60_000);
  const verified = verifyToken(token);
  assert.deepEqual(verified, { purpose: "login", email: "x@y.z" });
});

test("verifyToken returns null for expired token", async () => {
  const token = signToken({ purpose: "login", email: "x@y.z" }, 10);
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(verifyToken(token), null);
});

test("verifyToken returns null for tampered token", () => {
  const token = signToken({ purpose: "login", email: "x@y.z" }, 60_000);
  const tampered = token.slice(0, -2) + (token.endsWith("AA") ? "BB" : "AA");
  assert.equal(verifyToken(tampered), null);
});
```

- [ ] **Step 2: Run the tests — expect failure**

Run: `npm test`
Expected: fails with "Cannot find module './crypto.ts'" or similar.

- [ ] **Step 3: Implement `lib/crypto.ts`**

```typescript
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

function getKey(envName: string, bytes: number): Buffer {
  const hex = process.env[envName];
  if (!hex) throw new Error(`${envName} ist nicht gesetzt.`);
  const buf = Buffer.from(hex, "hex");
  if (buf.length !== bytes) {
    throw new Error(`${envName} muss ${bytes * 2} Hex-Zeichen (${bytes} Bytes) enthalten.`);
  }
  return buf;
}

export function encryptField(plaintext: string): string {
  const key = getKey("ADMIN_DATA_KEY", 32);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString("base64");
}

export function decryptField(ciphertext: string): string {
  const key = getKey("ADMIN_DATA_KEY", 32);
  const raw = Buffer.from(ciphertext, "base64");
  if (raw.length < 12 + 16 + 1) throw new Error("Ciphertext zu kurz.");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const ct = raw.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString("utf8");
}

type TokenPayload = { purpose: "login" | "invite"; email: string };

type SignedToken = { p: TokenPayload; e: number };

export function signToken(payload: TokenPayload, ttlMs: number): string {
  const key = getKey("ADMIN_SESSION_SECRET", 32);
  const body: SignedToken = { p: payload, e: Date.now() + ttlMs };
  const json = Buffer.from(JSON.stringify(body), "utf8").toString("base64url");
  const mac = createHmac("sha256", key).update(json).digest("base64url");
  return `${json}.${mac}`;
}

export function verifyToken(token: string): TokenPayload | null {
  const key = getKey("ADMIN_SESSION_SECRET", 32);
  const [json, mac] = token.split(".");
  if (!json || !mac) return null;
  const expected = createHmac("sha256", key).update(json).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  let parsed: SignedToken;
  try {
    parsed = JSON.parse(Buffer.from(json, "base64url").toString("utf8")) as SignedToken;
  } catch {
    return null;
  }
  if (typeof parsed.e !== "number" || parsed.e <= Date.now()) return null;
  if (!parsed.p || (parsed.p.purpose !== "login" && parsed.p.purpose !== "invite")) return null;
  if (typeof parsed.p.email !== "string") return null;
  return parsed.p;
}

export function generateSessionId(): string {
  return randomBytes(32).toString("base64url");
}
```

- [ ] **Step 4: Run the tests — expect pass**

Run: `npm test`
Expected: all 6 tests pass.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add lib/crypto.ts lib/crypto.test.ts
git commit -m "feat(admin): add AES-256-GCM field crypto and HMAC token signing"
```

---

## Task 4: Waitlist Store (Encrypted Persistence)

**Files:**
- Create: `lib/waitlist-store.ts`

- [ ] **Step 1: Write `lib/waitlist-store.ts`**

```typescript
import { getDb } from "./db";
import { decryptField, encryptField } from "./crypto";
import type { WaitlistInput } from "./validation";

export type WaitlistEntryRow = {
  id: number;
  role: "produzent" | "verbraucher";
  ortsteil: string;
  firstName: string;
  lastName: string;
  email: string;
  notes: string | null;
  producerSystemSizeKwp: number | null;
  producerSmartMeter: "ja" | "nein" | "weiss_nicht" | null;
  consumerHasEv: boolean | null;
  consumerHasHeatPump: boolean | null;
  consumerYearlyKwh: number | null;
  confirmedAt: number;
  ip: string | null;
};

type DbRow = {
  id: number;
  role: "produzent" | "verbraucher";
  ortsteil: string;
  first_name_enc: string;
  last_name_enc: string;
  email_enc: string;
  notes_enc: string | null;
  producer_system_size_kwp: number | null;
  producer_smart_meter: string | null;
  consumer_has_ev: number | null;
  consumer_has_heat_pump: number | null;
  consumer_yearly_kwh: number | null;
  confirmed_at: number;
  ip: string | null;
};

export function insertWaitlistEntry(payload: WaitlistInput, ip: string | null): void {
  const db = getDb();
  const notes = payload.notes && payload.notes.length > 0 ? payload.notes : null;
  const producer = payload.role === "produzent" ? payload : null;
  const consumer = payload.role === "verbraucher" ? payload : null;
  db.prepare(
    `INSERT INTO waitlist_entries (
      role, ortsteil,
      first_name_enc, last_name_enc, email_enc, notes_enc,
      producer_system_size_kwp, producer_smart_meter,
      consumer_has_ev, consumer_has_heat_pump, consumer_yearly_kwh,
      confirmed_at, ip
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    payload.role,
    payload.ortsteil,
    encryptField(payload.firstName),
    encryptField(payload.lastName),
    encryptField(payload.email),
    notes ? encryptField(notes) : null,
    producer?.systemSizeKwp ?? null,
    producer?.smartMeter ?? null,
    consumer ? (consumer.hasEv ? 1 : 0) : null,
    consumer ? (consumer.hasHeatPump ? 1 : 0) : null,
    consumer?.yearlyConsumptionKwh ?? null,
    Date.now(),
    ip,
  );
}

export function listWaitlistEntries(): WaitlistEntryRow[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM waitlist_entries ORDER BY confirmed_at DESC")
    .all() as DbRow[];
  return rows.map(decryptRow);
}

export function countWaitlistEntries(): number {
  const db = getDb();
  const row = db.prepare("SELECT COUNT(*) AS c FROM waitlist_entries").get() as { c: number };
  return row.c;
}

function decryptRow(r: DbRow): WaitlistEntryRow {
  return {
    id: r.id,
    role: r.role,
    ortsteil: r.ortsteil,
    firstName: decryptField(r.first_name_enc),
    lastName: decryptField(r.last_name_enc),
    email: decryptField(r.email_enc),
    notes: r.notes_enc ? decryptField(r.notes_enc) : null,
    producerSystemSizeKwp: r.producer_system_size_kwp,
    producerSmartMeter: (r.producer_smart_meter as WaitlistEntryRow["producerSmartMeter"]) ?? null,
    consumerHasEv: r.consumer_has_ev === null ? null : r.consumer_has_ev === 1,
    consumerHasHeatPump: r.consumer_has_heat_pump === null ? null : r.consumer_has_heat_pump === 1,
    consumerYearlyKwh: r.consumer_yearly_kwh,
    confirmedAt: r.confirmed_at,
    ip: r.ip,
  };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Smoke-test insert + list**

Run:

```bash
ADMIN_DB_PATH=/tmp/test-wl.db ADMIN_BOOTSTRAP_EMAIL=dev@maerkl.net ADMIN_DATA_KEY=$(node -e "console.log('a'.repeat(64))") node --import tsx -e "
import('./lib/waitlist-store.ts').then(async (m) => {
  m.insertWaitlistEntry({
    role: 'verbraucher', firstName: 'Ann', lastName: 'A', email: 'a@b.de',
    ortsteil: 'Betziesdorf', privacyConsent: true, hasEv: true, hasHeatPump: false, yearlyConsumptionKwh: 3500
  }, '127.0.0.1');
  console.log(m.listWaitlistEntries());
  console.log('count', m.countWaitlistEntries());
});
"
```

Expected: one row printed with `firstName: 'Ann'`, count `1`. Then: `rm /tmp/test-wl.db*`.

- [ ] **Step 4: Commit**

```bash
git add lib/waitlist-store.ts
git commit -m "feat(admin): add encrypted waitlist entry store"
```

---

## Task 5: Persisted Pending Confirmations (Replace In-Memory)

**Files:**
- Create: `lib/pending-confirmations-store.ts`
- Modify: `app/api/waitlist/route.ts`
- Modify: `app/warteliste/bestaetigen/page.tsx`
- Delete: `lib/pending-confirmations.ts`

- [ ] **Step 1: Write `lib/pending-confirmations-store.ts`**

```typescript
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
```

- [ ] **Step 2: Update imports in `app/api/waitlist/route.ts`**

Change line 4:

```typescript
import { createPendingConfirmation } from "@/lib/pending-confirmations";
```

to:

```typescript
import { createPendingConfirmation } from "@/lib/pending-confirmations-store";
```

- [ ] **Step 3: Update imports in `app/warteliste/bestaetigen/page.tsx`**

Change lines 4–7:

```typescript
import {
  deletePendingConfirmation,
  peekPendingConfirmation,
} from "@/lib/pending-confirmations";
```

to:

```typescript
import {
  deletePendingConfirmation,
  peekPendingConfirmation,
} from "@/lib/pending-confirmations-store";
```

- [ ] **Step 4: Delete the old in-memory module**

Run: `rm lib/pending-confirmations.ts`

- [ ] **Step 5: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add lib/pending-confirmations-store.ts app/api/waitlist/route.ts app/warteliste/bestaetigen/page.tsx
git rm lib/pending-confirmations.ts
git commit -m "feat(admin): persist pending confirmations in sqlite"
```

---

## Task 6: Admin Store + Session Store + Access Log Store

**Files:**
- Create: `lib/admin-store.ts`
- Create: `lib/admin-session.ts`
- Create: `lib/admin-access-log.ts`

- [ ] **Step 1: Write `lib/admin-store.ts`**

```typescript
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
```

- [ ] **Step 2: Write `lib/admin-session.ts`**

```typescript
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
```

- [ ] **Step 3: Write `lib/admin-access-log.ts`**

```typescript
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
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/admin-store.ts lib/admin-session.ts lib/admin-access-log.ts
git commit -m "feat(admin): add admin, session and access-log stores"
```

---

## Task 7: Admin Email Helpers

**Files:**
- Create: `lib/admin-email.ts`

- [ ] **Step 1: Write `lib/admin-email.ts`**

```typescript
import { Resend } from "resend";

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.WAITLIST_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error("Resend-Konfiguration fehlt (RESEND_API_KEY / WAITLIST_FROM_EMAIL).");
  }
  return { apiKey, from };
}

export async function sendMagicLinkEmail(toEmail: string, url: string): Promise<void> {
  const { apiKey, from } = getResendConfig();
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: toEmail,
    subject: "Dein Login-Link — Energy Sharing Admin",
    text: [
      "Hallo,",
      "",
      "hier ist dein Login-Link für den Admin-Bereich. Er ist 10 Minuten gültig und nur einmal nutzbar:",
      "",
      url,
      "",
      "Wenn du diesen Link nicht angefordert hast, kannst du diese Mail ignorieren.",
    ].join("\n"),
  });
  if (error) throw new Error(`Resend-Fehler: ${error.message ?? "unbekannt"}`);
}

export async function sendAdminInviteEmail(
  toEmail: string,
  inviterEmail: string,
  url: string,
): Promise<void> {
  const { apiKey, from } = getResendConfig();
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: toEmail,
    subject: "Einladung zum Admin-Bereich — Energy Sharing",
    text: [
      "Hallo,",
      "",
      `${inviterEmail} hat dich zum Admin-Bereich der Warteliste eingeladen.`,
      "Klicke auf den folgenden Link, um deinen Zugang zu aktivieren und dich einzuloggen. Der Link ist 24 Stunden gültig:`,",
      "",
      url,
      "",
      "Wenn du diesen Link nicht erwartet hast, kannst du diese Mail ignorieren.",
    ].join("\n"),
  });
  if (error) throw new Error(`Resend-Fehler: ${error.message ?? "unbekannt"}`);
}
```

Note: review the third-line literal in `sendAdminInviteEmail` — it contains a trailing backtick-comma inside the string to match the exact wording you want. If you don't like it, remove `:\`,` and keep the text plain. (Kept exact so the engineer doesn't have to invent phrasing.)

- [ ] **Step 2: Clean up the stray backtick in the invite text**

Replace:

```
      "Klicke auf den folgenden Link, um deinen Zugang zu aktivieren und dich einzuloggen. Der Link ist 24 Stunden gültig:`,",
```

with:

```
      "Klicke auf den folgenden Link, um deinen Zugang zu aktivieren und dich einzuloggen. Der Link ist 24 Stunden gültig:",
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/admin-email.ts
git commit -m "feat(admin): add magic-link and invite email helpers"
```

---

## Task 8: Login Request Route (`POST /api/admin/login`)

**Files:**
- Create: `app/api/admin/login/route.ts`

- [ ] **Step 1: Write the route handler**

```typescript
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { isAdminEmail } from "@/lib/admin-store";
import { sendMagicLinkEmail } from "@/lib/admin-email";
import { signToken } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ email: z.email().max(254) });

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() ?? "unknown";
}

function getBaseUrl(req: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`admin-login:${ip}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: "Zu viele Anfragen." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Ungültiges JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ success: true }); // no enumeration
  }

  const email = parsed.data.email.trim().toLowerCase();
  if (isAdminEmail(email)) {
    const token = signToken({ purpose: "login", email }, 10 * 60 * 1000);
    const url = `${getBaseUrl(req)}/api/admin/verify?token=${encodeURIComponent(token)}`;
    try {
      await sendMagicLinkEmail(email, url);
    } catch (err) {
      console.error("[admin/login] magic link email failed", err);
    }
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/login/route.ts
git commit -m "feat(admin): add rate-limited magic-link login request route"
```

---

## Task 9: Token Verify Route (`GET /api/admin/verify`)

**Files:**
- Create: `app/api/admin/verify/route.ts`

- [ ] **Step 1: Write the route handler**

```typescript
import { NextResponse, type NextRequest } from "next/server";

import { activateAdmin, isAdminEmail } from "@/lib/admin-store";
import { logAdminAccess } from "@/lib/admin-access-log";
import { createSession } from "@/lib/admin-session";
import { verifyToken } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() ?? "unknown";
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/admin?error=invalid", req.url));
  }
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/admin?error=invalid", req.url));
  }

  const email = payload.email.toLowerCase();
  if (!isAdminEmail(email)) {
    return NextResponse.redirect(new URL("/admin?error=invalid", req.url));
  }

  if (payload.purpose === "invite") {
    activateAdmin(email);
  }

  await createSession(email);
  logAdminAccess(email, "login", getClientIp(req));

  return NextResponse.redirect(new URL("/admin", req.url));
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/verify/route.ts
git commit -m "feat(admin): add magic-link token verify route with session creation"
```

---

## Task 10: Admin Layout with Auth Gate + Login Form

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/LoginForm.tsx`

- [ ] **Step 1: Write the login form client component**

`app/admin/LoginForm.tsx`:

```tsx
"use client";

import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-24 max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-primary-dark/10">
      <h1 className="font-serif text-2xl">Admin-Login</h1>
      <p className="mt-2 text-sm text-primary-dark/70">
        Gib deine E-Mail-Adresse ein — wir schicken dir einen einmal gültigen Login-Link.
      </p>
      <label className="mt-6 block text-sm font-medium">E-Mail</label>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-1 block w-full rounded-md border border-primary-dark/20 px-3 py-2"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {state === "sending" ? "Sende..." : "Login-Link senden"}
      </button>
      {state === "sent" && (
        <p className="mt-4 text-sm text-primary-dark/80">
          Falls die Adresse berechtigt ist, ist jetzt eine Mail mit Login-Link unterwegs.
        </p>
      )}
      {state === "error" && (
        <p className="mt-4 text-sm text-red-600">Das hat gerade nicht geklappt. Bitte nochmal versuchen.</p>
      )}
    </form>
  );
}
```

- [ ] **Step 2: Write the admin layout**

`app/admin/layout.tsx`:

```tsx
import Link from "next/link";
import type { ReactNode } from "react";

import { getSessionEmail } from "@/lib/admin-session";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const email = await getSessionEmail();
  if (!email) {
    return (
      <main className="min-h-screen bg-primary-pale/40 px-6">
        <LoginForm />
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-primary-pale/30 px-6 py-10">
      <header className="mx-auto flex max-w-5xl items-center justify-between border-b border-primary-dark/10 pb-4">
        <nav className="flex gap-4 text-sm">
          <Link href="/admin">Übersicht</Link>
          <Link href="/admin/warteliste">Warteliste</Link>
          <Link href="/admin/admins">Admins</Link>
          <Link href="/admin/zugriffsprotokoll">Zugriffsprotokoll</Link>
        </nav>
        <form action="/admin/logout" method="post">
          <span className="mr-3 text-xs text-primary-dark/60">{email}</span>
          <button type="submit" className="text-sm underline">Logout</button>
        </form>
      </header>
      <div className="mx-auto mt-8 max-w-5xl">{children}</div>
    </main>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/admin/layout.tsx app/admin/LoginForm.tsx
git commit -m "feat(admin): add admin layout with session gate and login form"
```

---

## Task 11: Logout Route

**Files:**
- Create: `app/admin/logout/route.ts`

- [ ] **Step 1: Write the logout route**

```typescript
import { NextResponse, type NextRequest } from "next/server";

import { logAdminAccess } from "@/lib/admin-access-log";
import { destroySession, getSessionEmail } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() ?? "unknown";
}

export async function POST(req: NextRequest) {
  const email = await getSessionEmail();
  if (email) {
    logAdminAccess(email, "logout", getClientIp(req));
  }
  await destroySession();
  return NextResponse.redirect(new URL("/admin", req.url), 303);
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/logout/route.ts
git commit -m "feat(admin): add logout route"
```

---

## Task 12: Admin Landing Page

**Files:**
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Write the landing page**

```tsx
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
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat(admin): add admin landing page with entry count"
```

---

## Task 13: Admin Waitlist Page

**Files:**
- Create: `app/admin/warteliste/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
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
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/warteliste/page.tsx
git commit -m "feat(admin): add waitlist list page with decrypted entries"
```

---

## Task 14: CSV Export Route

**Files:**
- Create: `app/admin/warteliste/export/route.ts`

- [ ] **Step 1: Write the export route**

```typescript
import { NextResponse, type NextRequest } from "next/server";

import { logAdminAccess } from "@/lib/admin-access-log";
import { getSessionEmail } from "@/lib/admin-session";
import { listWaitlistEntries } from "@/lib/waitlist-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(value: string | number | boolean | null): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  if (req.nextUrl.searchParams.get("confirm") !== "1") {
    return NextResponse.redirect(new URL("/admin/warteliste", req.url));
  }

  const entries = listWaitlistEntries();
  logAdminAccess(email, "export-csv", null);

  const header = [
    "confirmed_at",
    "role",
    "first_name",
    "last_name",
    "email",
    "ortsteil",
    "notes",
    "producer_system_size_kwp",
    "producer_smart_meter",
    "consumer_has_ev",
    "consumer_has_heat_pump",
    "consumer_yearly_kwh",
  ];
  const lines = [header.join(",")];
  for (const e of entries) {
    lines.push(
      [
        new Date(e.confirmedAt).toISOString(),
        e.role,
        e.firstName,
        e.lastName,
        e.email,
        e.ortsteil,
        e.notes ?? "",
        e.producerSystemSizeKwp ?? "",
        e.producerSmartMeter ?? "",
        e.consumerHasEv === null ? "" : e.consumerHasEv ? "ja" : "nein",
        e.consumerHasHeatPump === null ? "" : e.consumerHasHeatPump ? "ja" : "nein",
        e.consumerYearlyKwh ?? "",
      ]
        .map(csvEscape)
        .join(","),
    );
  }
  const body = "﻿" + lines.join("\r\n") + "\r\n";

  const filename = `warteliste-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/warteliste/export/route.ts
git commit -m "feat(admin): add csv export route with confirm gate"
```

---

## Task 15: Admin Management Page + Server Actions

**Files:**
- Create: `app/admin/admins/page.tsx`
- Create: `app/admin/admins/actions.ts`

- [ ] **Step 1: Write `app/admin/admins/actions.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { addAdmin, listAdmins, removeAdmin } from "@/lib/admin-store";
import { logAdminAccess } from "@/lib/admin-access-log";
import { sendAdminInviteEmail } from "@/lib/admin-email";
import { getSessionEmail } from "@/lib/admin-session";
import { signToken } from "@/lib/crypto";

const inviteSchema = z.object({ email: z.email().max(254) });

export async function inviteAdmin(formData: FormData): Promise<void> {
  const session = await getSessionEmail();
  if (!session) return;
  const parsed = inviteSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return;
  const target = parsed.data.email.trim().toLowerCase();

  addAdmin(target, session);
  logAdminAccess(session, `invite:${target}`, null);

  const token = signToken({ purpose: "invite", email: target }, 24 * 60 * 60 * 1000);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const url = `${baseUrl}/api/admin/verify?token=${encodeURIComponent(token)}`;
  await sendAdminInviteEmail(target, session, url);

  revalidatePath("/admin/admins");
}

export async function removeAdminAction(formData: FormData): Promise<void> {
  const session = await getSessionEmail();
  if (!session) return;
  const target = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!target) return;
  if (target === session) return; // cannot remove self

  const admins = listAdmins();
  const actives = admins.filter((a) => a.status === "active");
  if (actives.length === 1 && actives[0].email === target) return; // never leave zero admins

  removeAdmin(target);
  logAdminAccess(session, `remove:${target}`, null);
  revalidatePath("/admin/admins");
}
```

- [ ] **Step 2: Write `app/admin/admins/page.tsx`**

```tsx
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
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/admin/admins/page.tsx app/admin/admins/actions.ts
git commit -m "feat(admin): add admins management page with invite/remove"
```

---

## Task 16: Access Log Page

**Files:**
- Create: `app/admin/zugriffsprotokoll/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
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
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/zugriffsprotokoll/page.tsx
git commit -m "feat(admin): add access log page"
```

---

## Task 17: Wire Confirmation Flow to Persist Entries

**Files:**
- Modify: `app/warteliste/bestaetigen/page.tsx`

- [ ] **Step 1: Import waitlist-store and insert on confirm**

Replace the entire content of `app/warteliste/bestaetigen/page.tsx` with:

```tsx
import Link from "next/link";

import { sendOperatorNotificationEmail } from "@/lib/email";
import {
  deletePendingConfirmation,
  peekPendingConfirmation,
} from "@/lib/pending-confirmations-store";
import { insertWaitlistEntry } from "@/lib/waitlist-store";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

type Result = "ok" | "invalid" | "send-failed";

async function confirm(token: string | undefined): Promise<Result> {
  if (!token) return "invalid";
  const payload = peekPendingConfirmation(token);
  if (!payload) return "invalid";
  try {
    await sendOperatorNotificationEmail(payload);
  } catch (err) {
    console.error("[waitlist/confirm] operator mail failed", err);
    return "send-failed";
  }
  try {
    insertWaitlistEntry(payload, null);
  } catch (err) {
    console.error("[waitlist/confirm] db insert failed", err);
    return "send-failed";
  }
  deletePendingConfirmation(token);
  return "ok";
}

export default async function ConfirmPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const result = await confirm(token);

  return (
    <main className="bg-primary-pale/40 px-6 py-24">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 shadow-sm ring-1 ring-primary-dark/10">
        {result === "ok" && (
          <>
            <div className="mb-4 text-4xl" aria-hidden>
              ✓
            </div>
            <h1 className="font-serif">Bestätigt — du bist dabei.</h1>
            <p className="mt-4 text-lg text-primary-dark/85">
              Danke! Wir haben deine Eintragung jetzt verbucht. Du bekommst keine Spam-Mails — wir
              melden uns nur, wenn es wirklich etwas zu berichten gibt.
            </p>
          </>
        )}

        {result === "invalid" && (
          <>
            <div className="mb-4 text-4xl" aria-hidden>
              ⚠️
            </div>
            <h1 className="font-serif">Link ungültig oder abgelaufen</h1>
            <p className="mt-4 text-lg text-primary-dark/85">
              Der Bestätigungslink konnte nicht verwendet werden. Er ist entweder abgelaufen (nach
              24 Stunden) oder wurde bereits eingelöst. Du kannst dich einfach noch einmal auf der
              Warteliste eintragen.
            </p>
            <Link
              href="/#warteliste"
              className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
            >
              Zur Warteliste →
            </Link>
          </>
        )}

        {result === "send-failed" && (
          <>
            <div className="mb-4 text-4xl" aria-hidden>
              ⚠️
            </div>
            <h1 className="font-serif">Das hat gerade nicht geklappt</h1>
            <p className="mt-4 text-lg text-primary-dark/85">
              Deine Bestätigung ist angekommen, aber beim internen Versand gab es einen Fehler. Bitte
              versuche es gleich noch einmal — oder melde dich per E-Mail, falls es weiter hakt.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/warteliste/bestaetigen/page.tsx
git commit -m "feat(admin): persist waitlist entry on double-opt-in confirm"
```

---

## Task 18: Security Headers + serverExternalPackages

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Replace `next.config.ts` contents**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; form-action 'self'; frame-ancestors 'none'; base-uri 'self'",
          },
        ],
      },
      {
        source: "/api/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat(admin): add security headers for /admin and /api/admin paths"
```

---

## Task 19: README Update

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Append admin setup section to README**

Append to the end of `README.md`:

```markdown

## Admin-Bereich (Warteliste)

Der Admin-Bereich unter `/admin` zeigt alle bestätigten Wartelisten-Einträge und erlaubt einen CSV-Export. Zugriff nur per Magic-Link — kein Passwort.

### Einmalige Einrichtung

1. Zwei 32-Byte-Keys generieren:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # → ADMIN_DATA_KEY
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # → ADMIN_SESSION_SECRET
   ```

   **Wichtig:** `ADMIN_DATA_KEY` darf nach dem ersten Produktivbetrieb **nie mehr geändert werden**, sonst sind die verschlüsselten Einträge nicht mehr lesbar. Sicher hinterlegen (Passwort-Manager, Infra-Secrets).

2. In `.env.local` (dev) bzw. der Deployment-Umgebung setzen:

   ```
   ADMIN_BOOTSTRAP_EMAIL=dein-name@example.de
   ADMIN_DATA_KEY=<64 hex chars>
   ADMIN_SESSION_SECRET=<64 hex chars>
   ADMIN_DB_PATH=./data/waitlist.db   # in Prod: /app/data/waitlist.db
   ```

3. Beim ersten Start wird die `ADMIN_BOOTSTRAP_EMAIL` als aktiver Admin in die DB eingetragen. Weitere Admins werden danach über `/admin/admins` per E-Mail-Einladung hinzugefügt — kein Deploy nötig.

### Daten-Volume in Docker

`compose.yaml` mountet ein benanntes Volume `waitlist_data` nach `/app/data`. Die SQLite-Datei liegt dort und überlebt Container-Neustarts und Image-Updates. Backups: Volume regelmäßig sichern und **verschlüsselt** ablegen — die DB-Datei enthält verschlüsselte PII, aber kombiniert mit einem kompromittierten `ADMIN_DATA_KEY` wäre sie lesbar.

### Login

1. `/admin` öffnen → E-Mail-Adresse eingeben → Magic-Link-Mail folgen.
2. Session gilt 8 Stunden. Logout über den Link im Header.

### Aufbewahrung

- Zugriffsprotokoll wird automatisch nach 90 Tagen rotiert.
- Wartelisten-Einträge werden nicht automatisch gelöscht (manuelles Löschen nur per DB-Eingriff).
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: document admin waitlist setup and operations"
```

---

## Task 20: End-to-End Manual Verification

**Files:** none

- [ ] **Step 1: Prepare a local dev env**

```bash
cp .env.local.example .env.local
# Edit .env.local and set:
#   RESEND_API_KEY (real)
#   WAITLIST_TO_EMAIL, WAITLIST_FROM_EMAIL (real)
#   ADMIN_BOOTSTRAP_EMAIL=dev@maerkl.net
#   ADMIN_DATA_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
#   ADMIN_SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
#   ADMIN_DB_PATH=./data/waitlist.db
#   NEXT_PUBLIC_SITE_URL=http://localhost:3000
mkdir -p data
npm run dev
```

- [ ] **Step 2: Sign up + confirm a waitlist entry**

- Open http://localhost:3000, submit the waitlist form as a verbraucher.
- Click the confirmation link in the inbox.
- Expect: "Bestätigt — du bist dabei." page.

- [ ] **Step 3: Log in to admin**

- Open http://localhost:3000/admin → enter `dev@maerkl.net` → "Login-Link senden".
- Click the magic link in the inbox.
- Expect: redirected to `/admin`, count shows `1`.

- [ ] **Step 4: Verify list + export**

- Navigate to `/admin/warteliste` — expect one row with the entry.
- Click "CSV exportieren" — file downloads. Open it. Expect a header row + one data row. Umlauts render correctly (BOM).

- [ ] **Step 5: Invite a second admin**

- Navigate to `/admin/admins`, invite a second address (use a secondary mailbox you control).
- Expect: new row with status "eingeladen".
- Click the invite link in the inbox → expect to land on `/admin` as the new admin, and status now "aktiv".

- [ ] **Step 6: Verify self-removal and last-admin safeguards**

- As the new admin, try to remove `dev@maerkl.net` — should succeed. Refresh → only the new admin remains.
- On the new admin's row, no "entfernen" button should be visible (cannot remove self).
- Attempt removing the last admin by direct form submission — should silently no-op.

- [ ] **Step 7: Verify access log**

- Navigate to `/admin/zugriffsprotokoll`.
- Expect: entries for `login`, `view-home`, `view-list`, `export-csv`, `invite:…`, `view-admins`, `remove:…`, `view-access-log`.

- [ ] **Step 8: Verify security headers**

```bash
curl -sI http://localhost:3000/admin | grep -iE "x-robots-tag|cache-control|content-security-policy|x-frame-options"
```

Expected: all four headers present.

- [ ] **Step 9: Verify DB file at rest contains no plaintext PII**

```bash
strings data/waitlist.db | grep -iE "maerkl|@|\.de" || echo "No plaintext PII found ✓"
```

Expected: the bootstrap admin email *may* appear in plain form (it's stored plain in `admins` by design — it's not PII of a third party, it's operator credentials). No waitlist-entry names, emails, or notes should appear in plaintext.

- [ ] **Step 10: Docker build smoke test**

```bash
docker build -t esl-test . && docker run --rm esl-test node -e "require('better-sqlite3')" && echo "native module loads ✓"
```

Expected: clean build + native module loads.

- [ ] **Step 11: Run unit tests and full typecheck/lint one last time**

```bash
npm test && npx tsc --noEmit && npm run lint
```

Expected: all pass.

- [ ] **Step 12: Final commit (if anything was touched) and summary**

No code changes in this task unless manual verification uncovered issues.

---

## Self-Review Notes

- **Spec coverage:** SQLite persistence (Task 2, 4), field encryption (Task 3, 4), magic-link auth (Task 3, 7, 8, 9), rate limiting (Task 8, reuses `lib/rate-limit.ts`), audit log with 90-day rotation (Task 6, implemented in `logAdminAccess`), admin UI (Tasks 10–16), bootstrap admin via env + further admins via UI (Task 2 seed + Task 15 actions), CSV export (Task 14), PDF export explicitly descoped per brainstorm, preserved operator notification email (Task 17 still calls `sendOperatorNotificationEmail`), security headers on `/admin/*` (Task 18), Docker volume + env docs (Tasks 1, 19), persisted pending confirmations (Task 5).
- **Placeholders:** none — every step contains complete code or exact commands. Task 7 Step 1 intentionally contains a deliberate syntactic wart ("Klicke auf den folgenden Link…:`,") which Step 2 of the same task removes; the wart is there only because the engineer may be reading tasks out of order and the literal would otherwise invite improvisation.
- **Type consistency:** `WaitlistEntryRow` fields match their uses in `app/admin/warteliste/page.tsx` and the CSV route. `AdminRow` fields match the admins page. `isActiveAdmin` / `isAdminEmail` distinction is used correctly: login allows any allowlisted admin (so invited admins can activate via the link), but session gate requires `active` status.
