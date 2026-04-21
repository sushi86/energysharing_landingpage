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
  assert.equal(verified?.purpose, "login");
  assert.equal(verified?.email, "x@y.z");
  assert.equal(typeof verified?.jti, "string");
  assert.ok((verified?.jti.length ?? 0) >= 16);
  assert.equal(typeof verified?.expiresAt, "number");
});

test("signToken produces a unique jti per call", () => {
  const t1 = signToken({ purpose: "login", email: "x@y.z" }, 60_000);
  const t2 = signToken({ purpose: "login", email: "x@y.z" }, 60_000);
  const v1 = verifyToken(t1);
  const v2 = verifyToken(t2);
  assert.notEqual(v1?.jti, v2?.jti);
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
