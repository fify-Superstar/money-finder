import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  createUnpaidAccessRecord,
  getCustomerStartHref,
  getStripeHandoffConfig,
  hasRecordedPayment,
  isPaymentLinked,
  parsePaymentAccess,
  POST_PAYMENT_CONTINUE_PATH,
  readPaymentLinkUrl,
  serializePaymentAccess,
  stripeHandoff,
} from "./handoff.ts";

const EXAMPLE_PAYMENT_LINK = "https://buy.stripe.com/test_example_only";

test("customer start href stays on the assessment until a Payment Link is supplied", () => {
  const env = {};
  const config = getStripeHandoffConfig(env);

  assert.equal(readPaymentLinkUrl(env), null);
  assert.equal(config.paymentLinkUrl, null);
  assert.equal(isPaymentLinked(config), false);
  assert.equal(getCustomerStartHref(config), POST_PAYMENT_CONTINUE_PATH);
  assert.equal(getCustomerStartHref(config), "/assessment");
});

test("a configured Payment Link becomes the landing CTA without changing assessment routes", () => {
  const config = getStripeHandoffConfig({
    STRIPE_PAYMENT_LINK_URL: EXAMPLE_PAYMENT_LINK,
  });

  assert.equal(isPaymentLinked(config), true);
  assert.equal(getCustomerStartHref(config), EXAMPLE_PAYMENT_LINK);
  assert.equal(POST_PAYMENT_CONTINUE_PATH, "/assessment");
});

test("invalid or non-https Payment Link values are ignored", () => {
  assert.equal(readPaymentLinkUrl({ STRIPE_PAYMENT_LINK_URL: "not-a-url" }), null);
  assert.equal(
    readPaymentLinkUrl({ STRIPE_PAYMENT_LINK_URL: "http://buy.stripe.com/test" }),
    null,
  );
  assert.equal(readPaymentLinkUrl({ STRIPE_PAYMENT_LINK_URL: "   " }), null);
});

test("complete route requires Stripe retrieval and does not treat session_id as payment", () => {
  const complete = readFileSync(
    fileURLToPath(new URL("../../app/api/stripe/complete/route.ts", import.meta.url)),
    "utf8",
  );
  const success = readFileSync(
    fileURLToPath(new URL("../../app/(funnel)/success/page.tsx", import.meta.url)),
    "utf8",
  );

  assert.match(complete, /verifyPaidCheckoutSession/);
  assert.match(complete, /issueAccessCookieValue/);
  assert.match(complete, /ACCESS_COOKIE_NAME/);
  assert.doesNotMatch(complete, /hasRecordedPayment|PaymentAccessRecord/);
  assert.match(success, /\/api\/stripe\/complete/);
  assert.match(success, /verifyAccessToken/);
  assert.doesNotMatch(success, /hasRecordedPayment/);
});

test("handoff source does not hardcode a Stripe Payment Link URL", () => {
  const source = readFileSync(fileURLToPath(new URL("./handoff.ts", import.meta.url)), "utf8");
  assert.doesNotMatch(source, /buy\.stripe\.com/);
  assert.equal(typeof stripeHandoff.paymentLinkUrl === "string" || stripeHandoff.paymentLinkUrl === null, true);
});

test("payment access records round-trip and stay unpaid until paidAt is set", () => {
  const unpaid = createUnpaidAccessRecord();
  const restored = parsePaymentAccess(serializePaymentAccess(unpaid));

  assert.equal(hasRecordedPayment(unpaid), false);
  assert.deepEqual(restored, unpaid);
  assert.equal(parsePaymentAccess("not-json"), null);
});
