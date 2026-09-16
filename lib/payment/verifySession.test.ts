import assert from "node:assert/strict";
import test from "node:test";
import {
  createStripeSessionLookup,
  verifyPaidCheckoutSession,
  classifyPaidProductTier,
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
    amount_total: 4900,
    currency: "aud",
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

test("valid paid A$49 AUD sessions are accepted", async () => {
  const result = await verifyPaidCheckoutSession(PAID_ID, lookup(snapshot()));
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.payment.sessionId, PAID_ID);
    assert.equal(result.payment.email, "paid@example.test");
    assert.equal(result.payment.paidAt, "2023-11-14T22:13:20.000Z");
  }
});

test("valid paid A$19 AUD sessions are accepted", async () => {
  const result = await verifyPaidCheckoutSession(
    PAID_ID,
    lookup(snapshot({ amount_total: 1900, currency: "aud" })),
  );
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.payment.sessionId, PAID_ID);
  }
});

test("classifyPaidProductTier maps A$19 and A$49 AUD only", () => {
  assert.equal(classifyPaidProductTier(1900, "aud"), "standard");
  assert.equal(classifyPaidProductTier(4900, "AUD"), "premium");
  assert.equal(classifyPaidProductTier(1900, "usd"), null);
  assert.equal(classifyPaidProductTier(2000, "aud"), null);
  assert.equal(classifyPaidProductTier(null, "aud"), null);
});

test("paid sessions outside the A$19 and A$49 AUD tiers are rejected", async () => {
  const otherAmount = await verifyPaidCheckoutSession(
    PAID_ID,
    lookup(snapshot({ amount_total: 2000, currency: "aud" })),
  );
  const otherCurrency = await verifyPaidCheckoutSession(
    PAID_ID,
    lookup(snapshot({ amount_total: 4900, currency: "usd" })),
  );
  const tierOneWrongCurrency = await verifyPaidCheckoutSession(
    PAID_ID,
    lookup(snapshot({ amount_total: 1900, currency: "usd" })),
  );
  const missingAmount = await verifyPaidCheckoutSession(
    PAID_ID,
    lookup(snapshot({ amount_total: null, currency: "aud" })),
  );

  assert.equal(otherAmount.ok, false);
  assert.equal(otherCurrency.ok, false);
  assert.equal(tierOneWrongCurrency.ok, false);
  assert.equal(missingAmount.ok, false);
  if (!otherAmount.ok) {
    assert.equal(otherAmount.reason, "wrong_price");
  }
  if (!otherCurrency.ok) {
    assert.equal(otherCurrency.reason, "wrong_price");
  }
  if (!tierOneWrongCurrency.ok) {
    assert.equal(tierOneWrongCurrency.reason, "wrong_price");
  }
  if (!missingAmount.ok) {
    assert.equal(missingAmount.reason, "wrong_price");
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
