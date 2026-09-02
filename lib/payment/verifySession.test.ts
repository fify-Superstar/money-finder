import assert from "node:assert/strict";
import test from "node:test";
import {
  createStripeSessionLookup,
  verifyPaidCheckoutSession,
  type CheckoutSessionSnapshot,
} from "./verifySession.ts";

const PAID_ID = "cs_test_paidSession123";

function snapshot(
  overrides: Partial<CheckoutSessionSnapshot> = {},
): CheckoutSessionSnapshot {
  return {
    id: PAID_ID,
    status: "complete",
    payment_status: "paid",
    customer_email: "paid@example.test",
    created: 1_700_000_000,
    ...overrides,
  };
}

function lookup(session: CheckoutSessionSnapshot | Error) {
  return {
    async retrieve() {
      if (session instanceof Error) {
        throw session;
      }
      return session;
    },
  };
}

test("malformed session IDs are rejected without calling Stripe", async () => {
  let called = false;
  const result = await verifyPaidCheckoutSession("not-a-session", {
    async retrieve() {
      called = true;
      return snapshot();
    },
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "malformed");
  }
  assert.equal(called, false);
});

test("missing session IDs are rejected", async () => {
  const missing = await verifyPaidCheckoutSession(null, lookup(snapshot()));
  const empty = await verifyPaidCheckoutSession("  ", lookup(snapshot()));
  assert.equal(missing.ok, false);
  assert.equal(empty.ok, false);
  if (!missing.ok) {
    assert.equal(missing.reason, "missing");
  }
});

test("unpaid Stripe sessions are rejected", async () => {
  const result = await verifyPaidCheckoutSession(
    PAID_ID,
    lookup(snapshot({ payment_status: "unpaid" })),
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "unpaid");
  }
});

test("incomplete Stripe sessions are rejected", async () => {
  const result = await verifyPaidCheckoutSession(
    PAID_ID,
    lookup(snapshot({ status: "open", payment_status: "unpaid" })),
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "incomplete");
  }
});

test("complete but unpaid sessions are rejected", async () => {
  const result = await verifyPaidCheckoutSession(
    PAID_ID,
    lookup(snapshot({ status: "complete", payment_status: "unpaid" })),
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "unpaid");
  }
});

test("incomplete sessions are rejected even if payment_status is paid", async () => {
  const result = await verifyPaidCheckoutSession(
    PAID_ID,
    lookup(snapshot({ status: "open", payment_status: "paid" })),
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "incomplete");
  }
});

test("missing STRIPE_SECRET_KEY cannot retrieve a session and is not treated as paid", async () => {
  const lookupWithoutKey = createStripeSessionLookup({ STRIPE_SECRET_KEY: "" });
  await assert.rejects(
    () => lookupWithoutKey.retrieve(PAID_ID),
    /STRIPE_SECRET_KEY is not configured/,
  );

  const result = await verifyPaidCheckoutSession(PAID_ID, lookupWithoutKey);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "unavailable");
  }
});

test("valid paid sessions are accepted", async () => {
  const result = await verifyPaidCheckoutSession(PAID_ID, lookup(snapshot()));
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.payment.sessionId, PAID_ID);
    assert.equal(result.payment.email, "paid@example.test");
    assert.equal(result.payment.paidAt, "2023-11-14T22:13:20.000Z");
  }
});

test("Stripe retrieve failures are not treated as paid", async () => {
  const result = await verifyPaidCheckoutSession(
    PAID_ID,
    lookup(new Error("network")),
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "unavailable");
  }
});
