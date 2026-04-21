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
