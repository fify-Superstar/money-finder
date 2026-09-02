import Stripe from "stripe";

export type StripeWebhookResult = {
  status: number;
  body: { error?: string; received?: boolean };
};

type ConstructEvent = (
  payload: string,
  header: string,
  secret: string,
) => Stripe.Event;

/**
 * Verifies the Stripe-Signature header. Does not grant browser access.
 * Access cookies are issued only after /success retrieves a paid Checkout Session.
 *
 * Async methods (payment_status !== "paid" at redirect time) are not granted
 * access here. The customer must reach /success with a session that Stripe
 * reports as complete and paid.
 */
export function handleStripeWebhook(
  rawBody: string,
  signature: string | null,
  secret: string | null,
  constructEvent: ConstructEvent = (payload, header, signingSecret) =>
    Stripe.webhooks.constructEvent(payload, header, signingSecret),
): StripeWebhookResult {
  if (!secret || !signature) {
    return {
      status: 400,
      body: { error: "Missing webhook secret or signature" },
    };
  }

  let event: Stripe.Event;
  try {
    event = constructEvent(rawBody, signature, secret);
  } catch {
    return {
      status: 400,
      body: { error: "Invalid signature" },
    };
  }

  if (event.type === "checkout.session.completed") {
    // Audit no-op. Do not set cookies from a webhook POST.
  }

  return {
    status: 200,
    body: { received: true },
  };
}
