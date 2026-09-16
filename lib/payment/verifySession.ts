import Stripe from "stripe";
import { isCheckoutSessionId } from "./sessionId.ts";

export { CHECKOUT_SESSION_ID_PATTERN, isCheckoutSessionId } from "./sessionId.ts";

/** Paid access is granted for either product tier, in AUD only. */
export const STANDARD_AMOUNT_CENTS = 1900;
export const PREMIUM_AMOUNT_CENTS = 4900;
export const PAID_ACCESS_AMOUNT_CENTS = [
  STANDARD_AMOUNT_CENTS,
  PREMIUM_AMOUNT_CENTS,
] as const;
export const PAID_ACCESS_CURRENCIES = ["aud"] as const;

export type PaidProductTier = "standard" | "premium";

export function classifyPaidProductTier(
  amountTotal: number | null | undefined,
  currency: string | null | undefined,
): PaidProductTier | null {
  const currencyNorm = currency?.trim().toLowerCase() ?? "";
  if (!(PAID_ACCESS_CURRENCIES as readonly string[]).includes(currencyNorm)) {
    return null;
  }
  if (amountTotal === STANDARD_AMOUNT_CENTS) {
    return "standard";
  }
  if (amountTotal === PREMIUM_AMOUNT_CENTS) {
    return "premium";
  }
  return null;
}

export type VerifiedPayment = {
  sessionId: string;
  email: string | null;
  paidAt: string;
};

export type SessionVerificationResult =
  | { ok: true; payment: VerifiedPayment }
  | {
      ok: false;
      reason:
        | "missing"
        | "malformed"
        | "incomplete"
        | "unpaid"
        | "unavailable"
        | "wrong_price";
    };

export type CheckoutSessionSnapshot = {
  id: string;
  status: string | null;
  payment_status: string | null;
  amount_total?: number | null;
  currency?: string | null;
  customer_email?: string | null;
  customer_details?: { email?: string | null } | null;
  created?: number | null;
};

export type StripeSessionLookup = {
  retrieve(sessionId: string): Promise<CheckoutSessionSnapshot>;
};

export function createStripeSessionLookup(
  env: NodeJS.ProcessEnv = process.env,
): StripeSessionLookup {
  const secretKey = env.STRIPE_SECRET_KEY?.trim() ?? "";
  if (!secretKey) {
    return {
      async retrieve() {
        throw new Error("STRIPE_SECRET_KEY is not configured");
      },
    };
  }

  const stripe = new Stripe(secretKey);

  return {
    async retrieve(sessionId: string) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_email,
        customer_details: session.customer_details
          ? { email: session.customer_details.email }
          : null,
        created: session.created,
      };
    },
  };
}

function emailFromSession(session: CheckoutSessionSnapshot): string | null {
  const detailsEmail = session.customer_details?.email?.trim();
  if (detailsEmail) {
    return detailsEmail;
  }

  const customerEmail = session.customer_email?.trim();
  return customerEmail || null;
}

function paidAtFromSession(session: CheckoutSessionSnapshot): string {
  if (typeof session.created === "number" && session.created > 0) {
    return new Date(session.created * 1000).toISOString();
  }

  return new Date().toISOString();
}

export function isExpectedPaidPrice(session: CheckoutSessionSnapshot): boolean {
  return classifyPaidProductTier(session.amount_total, session.currency) !== null;
}

export async function verifyPaidCheckoutSession(
  sessionId: string | null | undefined,
  lookup: StripeSessionLookup = createStripeSessionLookup(),
): Promise<SessionVerificationResult> {
  if (sessionId == null || sessionId.trim() === "") {
    return { ok: false, reason: "missing" };
  }

  if (!isCheckoutSessionId(sessionId)) {
    return { ok: false, reason: "malformed" };
  }

  let session: CheckoutSessionSnapshot;
  try {
    session = await lookup.retrieve(sessionId);
  } catch {
    return { ok: false, reason: "unavailable" };
  }

  if (session.status !== "complete") {
    return { ok: false, reason: "incomplete" };
  }

  if (session.payment_status !== "paid") {
    return { ok: false, reason: "unpaid" };
  }

  if (!isExpectedPaidPrice(session)) {
    return { ok: false, reason: "wrong_price" };
  }

  return {
    ok: true,
    payment: {
      sessionId: session.id,
      email: emailFromSession(session),
      paidAt: paidAtFromSession(session),
    },
  };
}
