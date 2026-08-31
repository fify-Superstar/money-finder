import assert from "node:assert/strict";
import test from "node:test";
import {
  createUnpaidAccessRecord,
  getCustomerStartHref,
  hasRecordedPayment,
  isPaymentLinked,
  parsePaymentAccess,
  POST_PAYMENT_CONTINUE_PATH,
  serializePaymentAccess,
  stripeHandoff,
} from "./handoff.ts";

test("customer start href stays on the assessment until a Payment Link is supplied", () => {
  assert.equal(stripeHandoff.paymentLinkUrl, null);
  assert.equal(isPaymentLinked(), false);
  assert.equal(getCustomerStartHref(), POST_PAYMENT_CONTINUE_PATH);
  assert.equal(getCustomerStartHref(), "/assessment");
});

test("a configured Payment Link becomes the landing CTA without changing assessment routes", () => {
  const href = getCustomerStartHref({
    ...stripeHandoff,
    paymentLinkUrl: "https://buy.stripe.com/example",
  });

  assert.equal(href, "https://buy.stripe.com/example");
  assert.equal(POST_PAYMENT_CONTINUE_PATH, "/assessment");
});

test("payment access records round-trip and stay unpaid until paidAt is set", () => {
  const unpaid = createUnpaidAccessRecord();
  const restored = parsePaymentAccess(serializePaymentAccess(unpaid));

  assert.equal(hasRecordedPayment(unpaid), false);
  assert.deepEqual(restored, unpaid);
  assert.equal(parsePaymentAccess("not-json"), null);
});
