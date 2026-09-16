import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";
import {
  STRIPE_CHECKOUT_WEBHOOK_API_VERSION,
  handleCheckoutSessionWebhook,
} from "./checkoutWebhook.ts";
import type { PurchaseLogRecord } from "../sheets/logPurchase.ts";

const SECRET = "whsec_test_secret";

function signedPayload(session: Record<string, unknown>, type = "checkout.session.completed") {
  const payload = JSON.stringify({
    id: "evt_test_checkout_1",
    object: "event",
    type,
    data: { object: session },
  });
  const signature = Stripe.webhooks.generateTestHeaderString({
    payload,
    secret: SECRET,
  });
  return { payload, signature };
}

test("checkout webhook API version is 2026-07-29.dahlia", () => {
  assert.equal(STRIPE_CHECKOUT_WEBHOOK_API_VERSION, "2026-07-29.dahlia");
});

test("pages webhook route verifies Stripe-Signature and never issues the access cookie", () => {
  const route = readFileSync(
    fileURLToPath(new URL("../../pages/api/webhooks/stripe.ts", import.meta.url)),
    "utf8",
  );
  assert.match(route, /bodyParser:\s*false/);
  assert.match(route, /stripe-signature/);
  assert.match(route, /STRIPE_WEBHOOK_SECRET/);
  assert.match(route, /2026-07-29\.dahlia/);
  assert.doesNotMatch(route, /issueAccessCookieValue|ACCESS_COOKIE_NAME|cookies\.set/);
});

test("checkout webhook rejects an invalid signature", async () => {
  const result = await handleCheckoutSessionWebhook(
    JSON.stringify({ type: "checkout.session.completed" }),
    "t=1,v1=deadbeef",
    SECRET,
  );
  assert.equal(result.status, 400);
  assert.equal(result.body.error, "Invalid signature");
});

test("checkout webhook logs an A$19 Standard purchase", async () => {
  const { payload, signature } = signedPayload({
    id: "cs_test_standard19",
    object: "checkout.session",
    amount_total: 1900,
    currency: "aud",
    payment_status: "paid",
    customer_email: "standard@example.test",
  });
  const logged: PurchaseLogRecord[] = [];

  const result = await handleCheckoutSessionWebhook(
    payload,
    signature,
    SECRET,
    async (record) => {
      logged.push(record);
      return { ok: true };
    },
  );

  assert.equal(result.status, 200);
  assert.equal(logged.length, 1);
  assert.equal(logged[0]?.productTier, "standard");
  assert.equal(logged[0]?.productLabel, "A$19 Standard");
  assert.equal(logged[0]?.sessionId, "cs_test_standard19");
});

test("checkout webhook logs an A$49 Premium purchase", async () => {
  const { payload, signature } = signedPayload({
    id: "cs_test_premium49",
    object: "checkout.session",
    amount_total: 4900,
    currency: "aud",
    payment_status: "paid",
    customer_details: { email: "premium@example.test" },
  });
  const logged: PurchaseLogRecord[] = [];

  const result = await handleCheckoutSessionWebhook(
    payload,
    signature,
    SECRET,
    async (record) => {
      logged.push(record);
      return { ok: true };
    },
  );

  assert.equal(result.status, 200);
  assert.equal(logged.length, 1);
  assert.equal(logged[0]?.productTier, "premium");
  assert.equal(logged[0]?.productLabel, "A$49 Premium");
  assert.equal(logged[0]?.email, "premium@example.test");
});

test("checkout webhook does not log unpaid or unknown-amount sessions", async () => {
  const unpaid = signedPayload({
    id: "cs_test_unpaid",
    object: "checkout.session",
    amount_total: 4900,
    currency: "aud",
    payment_status: "unpaid",
  });
  const unknown = signedPayload({
    id: "cs_test_other",
    object: "checkout.session",
    amount_total: 1200,
    currency: "aud",
    payment_status: "paid",
  });
  let calls = 0;
  const log = async () => {
    calls += 1;
    return { ok: true as const };
  };

  const unpaidResult = await handleCheckoutSessionWebhook(
    unpaid.payload,
    unpaid.signature,
    SECRET,
    log,
  );
  const unknownResult = await handleCheckoutSessionWebhook(
    unknown.payload,
    unknown.signature,
    SECRET,
    log,
  );

  assert.equal(unpaidResult.status, 200);
  assert.equal(unknownResult.status, 200);
  assert.equal(calls, 0);
});

test("checkout webhook returns 500 when the Google Sheets log fails", async () => {
  const { payload, signature } = signedPayload({
    id: "cs_test_premium49",
    object: "checkout.session",
    amount_total: 4900,
    currency: "aud",
    payment_status: "paid",
  });

  const result = await handleCheckoutSessionWebhook(
    payload,
    signature,
    SECRET,
    async () => ({ ok: false, reason: "sheets_rejected" }),
  );

  assert.equal(result.status, 500);
});
