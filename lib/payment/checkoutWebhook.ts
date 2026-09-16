import Stripe from "stripe";
import {
  logPurchaseToGoogleSheet,
  PRODUCT_TIER_LABEL,
  type PurchaseLogRecord,
  type PurchaseLogResult,
} from "../sheets/logPurchase.ts";
import { classifyPaidProductTier } from "./verifySession.ts";

/**
 * Stripe Checkout webhook schema pin requested for this logger.
 * The Node SDK types only list LatestApiVersion (currently 2026-08-26.dahlia).
 */
export const STRIPE_CHECKOUT_WEBHOOK_API_VERSION = "2026-07-29.dahlia";

export type StripeCheckoutWebhookResult = {
  status: number;
  body: { error?: string; received?: boolean };
};

type ConstructEvent = (
  payload: string,
  header: string,
  secret: string,
) => Stripe.Event;

type LogPurchase = (record: PurchaseLogRecord) => Promise<PurchaseLogResult>;

function emailFromSession(session: Stripe.Checkout.Session): string | null {
  const detailsEmail = session.customer_details?.email?.trim();
  if (detailsEmail) {
    return detailsEmail;
  }
  const customerEmail = session.customer_email?.trim();
  return customerEmail || null;
}

/**
 * Verifies Stripe-Signature, classifies A$19 Standard vs A$49 Premium, and
 * forwards paid rows to the Google Sheets log. Does not grant browser access.
 */
export async function handleCheckoutSessionWebhook(
  rawBody: string,
  signature: string | null,
  secret: string | null,
  logPurchase: LogPurchase = logPurchaseToGoogleSheet,
  constructEvent: ConstructEvent = (payload, header, signingSecret) =>
    Stripe.webhooks.constructEvent(payload, header, signingSecret),
): Promise<StripeCheckoutWebhookResult> {
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

  if (event.type !== "checkout.session.completed") {
    return {
      status: 200,
      body: { received: true },
    };
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    return {
      status: 200,
      body: { received: true },
    };
  }

  const productTier = classifyPaidProductTier(
    session.amount_total,
    session.currency,
  );
  if (!productTier || typeof session.amount_total !== "number") {
    return {
      status: 200,
      body: { received: true },
    };
  }

  const logged = await logPurchase({
    loggedAt: new Date().toISOString(),
    eventId: event.id,
    sessionId: session.id,
    email: emailFromSession(session),
    amountTotal: session.amount_total,
    currency: session.currency ?? "aud",
    productTier,
    productLabel: PRODUCT_TIER_LABEL[productTier],
    paymentStatus: session.payment_status,
  });

  if (!logged.ok) {
    return {
      status: 500,
      body: { error: "Purchase log failed" },
    };
  }

  return {
    status: 200,
    body: { received: true },
  };
}
