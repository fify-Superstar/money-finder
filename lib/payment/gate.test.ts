import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  ACCESS_COOKIE_NAME,
  createAccessPayload,
  signAccessToken,
} from "./accessCookie.ts";
import { hasRecordedPayment, type PaymentAccessRecord } from "./handoff.ts";
import { allowProtectedRequest, checkoutReturnPath } from "./gate.ts";

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
    await allowProtectedRequest(
      "/assessment",
      cookieHeader("v1.not.real"),
      paidEnv,
    ),
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
    await allowProtectedRequest(
      "/assessment",
      cookieHeader(token),
      paidEnv,
      now + 1000,
    ),
    true,
  );
  assert.equal(
    await allowProtectedRequest(
      "/results",
      cookieHeader(token),
      paidEnv,
      now + 1000,
    ),
    true,
  );
});

test("a premium Payment Link alone enables payment gating", async () => {
  assert.equal(
    await allowProtectedRequest("/assessment", undefined, {
      STRIPE_PREMIUM_PAYMENT_LINK_URL: PAYMENT_LINK,
    }),
    false,
  );
});

test("a Stripe session_id on /assessment is handed to /success instead of dropped", () => {
  assert.equal(
    checkoutReturnPath("/assessment", "cs_live_paidSession123"),
    "/success?session_id=cs_live_paidSession123",
  );
  assert.equal(
    checkoutReturnPath("/assessment", "cs_test_paidSession123"),
    "/success?session_id=cs_test_paidSession123",
  );
  assert.equal(checkoutReturnPath("/assessment", null), null);
  assert.equal(checkoutReturnPath("/", "cs_live_paidSession123"), null);
});

test("missing checkout settings never disable paid access", async () => {
  assert.equal(
    await allowProtectedRequest("/assessment", undefined, {}),
    false,
  );
  assert.equal(await allowProtectedRequest("/results", undefined, {}), false);
});

test("invalid or missing Payment Links fail closed", async () => {
  assert.equal(
    await allowProtectedRequest("/assessment", undefined, {
      STRIPE_PAYMENT_LINK_URL: "not-a-url",
    }),
    false,
  );
  assert.equal(
    await allowProtectedRequest("/results", undefined, {
      STRIPE_PAYMENT_LINK_URL: "http://buy.stripe.com/test",
    }),
    false,
  );
  assert.equal(
    await allowProtectedRequest("/assessment", undefined, {
      STRIPE_PAYMENT_LINK_URL: "",
    }),
    false,
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

  assert.doesNotMatch(
    gate,
    /hasRecordedPayment|PaymentAccessRecord|sessionStorage/,
  );
  assert.doesNotMatch(
    middleware,
    /hasRecordedPayment|PaymentAccessRecord|sessionStorage/,
  );
  assert.match(middleware, /checkoutReturnPath/);
});

test("malformed access cookies fail closed without throwing", async () => {
  for (const cookie of [
    "mf_paid_access=%E0%A4%A",
    "mf_paid_access=v1.e30.*",
    "mf_paid_access=v1.e30.!!!",
  ]) {
    assert.equal(
      await allowProtectedRequest("/results", cookie, paidEnv),
      false,
    );
  }
});
test("public pages remain accessible without payment", async () => {
  for (const path of ["/", "/privacy", "/terms", "/unlock"]) {
    assert.equal(await allowProtectedRequest(path, undefined, {}), true);
  }
});

test("valid paid access survives missing checkout environment settings", async () => {
  const now = Date.parse("2026-10-15T00:00:00.000Z");
  const token = await signAccessToken(
    createAccessPayload(
      {
        sessionId: "cs_live_paidSession123",
        email: null,
        paidAt: new Date(now).toISOString(),
      },
      now,
    ),
    SECRET,
  );
  assert.equal(
    await allowProtectedRequest(
      "/assessment",
      cookieHeader(token),
      { PAYMENT_ACCESS_SECRET: SECRET },
      now + 1000,
    ),
    true,
  );
  assert.equal(
    await allowProtectedRequest(
      "/results",
      cookieHeader(token),
      {},
      now + 1000,
    ),
    false,
  );
});
