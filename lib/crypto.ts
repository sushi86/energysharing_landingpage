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

export type VerifiedToken = TokenPayload & { jti: string; expiresAt: number };

type SignedToken = { p: TokenPayload; e: number; j: string };

export function signToken(payload: TokenPayload, ttlMs: number): string {
  const key = getKey("ADMIN_SESSION_SECRET", 32);
  const body: SignedToken = {
    p: payload,
    e: Date.now() + ttlMs,
    j: randomBytes(16).toString("base64url"),
  };
  const json = Buffer.from(JSON.stringify(body), "utf8").toString("base64url");
  const mac = createHmac("sha256", key).update(json).digest("base64url");
  return `${json}.${mac}`;
}

export function verifyToken(token: string): VerifiedToken | null {
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
  if (typeof parsed.j !== "string" || parsed.j.length === 0) return null;
  if (!parsed.p || (parsed.p.purpose !== "login" && parsed.p.purpose !== "invite")) return null;
  if (typeof parsed.p.email !== "string") return null;
  return { purpose: parsed.p.purpose, email: parsed.p.email, jti: parsed.j, expiresAt: parsed.e };
}

export function generateSessionId(): string {
  return randomBytes(32).toString("base64url");
}
