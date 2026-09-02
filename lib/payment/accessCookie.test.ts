import assert from "node:assert/strict";
import test from "node:test";
import {
  accessCookieOptions,
  createAccessPayload,
  requireAccessSigningSecret,
  signAccessToken,
  verifyAccessToken,
} from "./accessCookie.ts";

const SECRET = "test-payment-access-secret-not-for-production";
const payment = {
  sessionId: "cs_test_paidSession123",
  email: "paid@example.test",
  paidAt: "2026-09-01T00:00:00.000Z",
};

test("a signed access cookie verifies", async () => {
  const now = Date.parse("2026-09-01T00:00:00.000Z");
  const token = await signAccessToken(createAccessPayload(payment, now), SECRET);
  const payload = await verifyAccessToken(token, SECRET, now + 1000);

  assert.equal(payload?.sessionId, payment.sessionId);
  assert.equal(payload?.email, payment.email);
  assert.equal(payload?.issuedAt, now);
});

test("an expired cookie is rejected", async () => {
  const issuedAt = Date.parse("2026-09-01T00:00:00.000Z");
  const token = await signAccessToken(
    createAccessPayload(payment, issuedAt),
    SECRET,
  );
  const later = issuedAt + 31 * 24 * 60 * 60 * 1000;
  assert.equal(await verifyAccessToken(token, SECRET, later), null);
});

test("a tampered cookie is rejected", async () => {
  const now = Date.parse("2026-09-01T00:00:00.000Z");
  const token = await signAccessToken(createAccessPayload(payment, now), SECRET);
  const parts = token.split(".");
  const body = Buffer.from(parts[1] ?? "", "base64url").toString("utf8");
  const tamperedBody = Buffer.from(
    body.replace("cs_test_paidSession123", "cs_test_attacker"),
    "utf8",
  ).toString("base64url");
  const tampered = `${parts[0]}.${tamperedBody}.${parts[2]}`;

  assert.equal(await verifyAccessToken(tampered, SECRET, now + 1000), null);
});

test("access cookie flags are httpOnly, Lax, and Secure only in production", () => {
  const local = accessCookieOptions({ NODE_ENV: "development" });
  assert.equal(local.httpOnly, true);
  assert.equal(local.sameSite, "lax");
  assert.equal(local.path, "/");
  assert.equal(local.secure, false);

  const production = accessCookieOptions({ NODE_ENV: "production" });
  assert.equal(production.httpOnly, true);
  assert.equal(production.sameSite, "lax");
  assert.equal(production.path, "/");
  assert.equal(production.secure, true);
});

test("missing production signing secret fails closed", async () => {
  assert.throws(
    () => requireAccessSigningSecret({ NODE_ENV: "production" }),
    /PAYMENT_ACCESS_SECRET is required in production/,
  );
  assert.equal(
    await verifyAccessToken("v1.anything.signature", null, Date.now()),
    null,
  );
  await assert.rejects(
    () => signAccessToken(createAccessPayload(payment), ""),
    /refusing to use a default secret/,
  );
});
