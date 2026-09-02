import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";
import { handleStripeWebhook } from "./webhook.ts";

const SECRET = "whsec_test_secret";

test("webhook rejects an invalid signature", () => {
  const result = handleStripeWebhook(
    JSON.stringify({ type: "checkout.session.completed" }),
    "t=1,v1=deadbeef",
    SECRET,
  );

  assert.equal(result.status, 400);
  assert.equal(result.body.error, "Invalid signature");
});

test("webhook rejects missing signature or secret", () => {
  const missingSig = handleStripeWebhook("{}", null, SECRET);
  const missingSecret = handleStripeWebhook("{}", "t=1,v1=abc", null);

  assert.equal(missingSig.status, 400);
  assert.equal(missingSecret.status, 400);
});

test("webhook route verifies Stripe-Signature and never issues the access cookie", () => {
  const route = readFileSync(
    fileURLToPath(new URL("../../app/api/stripe/webhook/route.ts", import.meta.url)),
    "utf8",
  );
  const helper = readFileSync(
    fileURLToPath(new URL("./webhook.ts", import.meta.url)),
    "utf8",
  );

  assert.match(route, /stripe-signature/);
  assert.match(route, /STRIPE_WEBHOOK_SECRET/);
  assert.doesNotMatch(route, /issueAccessCookieValue|ACCESS_COOKIE_NAME|cookies\.set/);
  assert.doesNotMatch(helper, /issueAccessCookieValue|ACCESS_COOKIE_NAME/);
});

test("webhook accepts a signed checkout.session.completed event without granting access", () => {
  const payload = JSON.stringify({
    id: "evt_test_1",
    object: "event",
    type: "checkout.session.completed",
    data: { object: { id: "cs_test_paidSession123" } },
  });
  const signature = Stripe.webhooks.generateTestHeaderString({
    payload,
    secret: SECRET,
  });

  const result = handleStripeWebhook(payload, signature, SECRET);
  assert.equal(result.status, 200);
  assert.equal(result.body.received, true);
});
