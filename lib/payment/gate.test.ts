import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  ACCESS_COOKIE_NAME,
  createAccessPayload,
  signAccessToken,
} from "./accessCookie.ts";
import {
  hasRecordedPayment,
  type PaymentAccessRecord,
} from "./handoff.ts";
import { allowProtectedRequest } from "./gate.ts";

const SECRET = "test-payment-access-secret-not-for-production";
const PAYMENT_LINK = "https://buy.stripe.com/test_example_only";
const paidEnv = {
  STRIPE_PAYMENT_LINK_URL: PAYMENT_LINK,
  PAYMENT_ACCESS_SECRET: SECRET,
};

function cookieHeader(token: string): string {
  return `${ACCESS_COOKIE_NAME}=${token}`;
}

test("middleware blocks missing cookies when payment mode is enabled", async () => {
  assert.equal(
    await allowProtectedRequest("/assessment", undefined, paidEnv),
    false,
  );
  assert.equal(await allowProtectedRequest("/results", "", paidEnv), false);
});

test("middleware blocks invalid cookies when payment mode is enabled", async () => {
  assert.equal(
    await allowProtectedRequest("/assessment", cookieHeader("v1.not.real"), paidEnv),
    false,
  );
});

test("middleware permits a valid signed cookie", async () => {
  const now = Date.parse("2026-09-01T00:00:00.000Z");
  const token = await signAccessToken(
    createAccessPayload(
      {
        sessionId: "cs_test_paidSession123",
        email: "paid@example.test",
        paidAt: "2026-09-01T00:00:00.000Z",
      },
      now,
    ),
    SECRET,
  );

  assert.equal(
    await allowProtectedRequest("/assessment", cookieHeader(token), paidEnv, now + 1000),
    true,
  );
  assert.equal(
    await allowProtectedRequest("/results", cookieHeader(token), paidEnv, now + 1000),
    true,
  );
});

test("demo mode does not gate assessment or results", async () => {
  assert.equal(await allowProtectedRequest("/assessment", undefined, {}), true);
  assert.equal(await allowProtectedRequest("/results", undefined, {}), true);
});

test("invalid or missing Payment Link does not enable payment gating", async () => {
  assert.equal(
    await allowProtectedRequest("/assessment", undefined, {
      STRIPE_PAYMENT_LINK_URL: "not-a-url",
    }),
    true,
  );
  assert.equal(
    await allowProtectedRequest("/results", undefined, {
      STRIPE_PAYMENT_LINK_URL: "http://buy.stripe.com/test",
    }),
    true,
  );
  assert.equal(
    await allowProtectedRequest("/assessment", undefined, {
      STRIPE_PAYMENT_LINK_URL: "",
    }),
    true,
  );
});

test("a PaymentAccessRecord or query-like cookie cannot unlock payment mode", async () => {
  const recorded: PaymentAccessRecord = {
    version: 1,
    source: "stripe-payment-link",
    checkoutSessionId: "cs_test_paidSession123",
    paidAt: "2026-09-01T00:00:00.000Z",
  };
  assert.equal(hasRecordedPayment(recorded), true);
  assert.equal(
    await allowProtectedRequest("/assessment", undefined, paidEnv),
    false,
  );
  assert.equal(
    await allowProtectedRequest(
      "/results",
      "session_id=cs_test_paidSession123",
      paidEnv,
    ),
    false,
  );
});

test("payment gate source does not treat browser storage as proof of payment", () => {
  const gate = readFileSync(
    fileURLToPath(new URL("./gate.ts", import.meta.url)),
    "utf8",
  );
  const middleware = readFileSync(
    fileURLToPath(new URL("../../middleware.ts", import.meta.url)),
    "utf8",
  );

  assert.doesNotMatch(gate, /hasRecordedPayment|PaymentAccessRecord|sessionStorage/);
  assert.doesNotMatch(
    middleware,
    /hasRecordedPayment|PaymentAccessRecord|sessionStorage/,
  );
});
