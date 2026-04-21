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
