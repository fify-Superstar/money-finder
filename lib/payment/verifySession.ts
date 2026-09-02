import Stripe from "stripe";

export const CHECKOUT_SESSION_ID_PATTERN = /^cs_(test|live)_[A-Za-z0-9]+$/;

export type VerifiedPayment = {
  sessionId: string;
  email: string | null;
  paidAt: string;
};

export type SessionVerificationResult =
  | { ok: true; payment: VerifiedPayment }
  | { ok: false; reason: "missing" | "malformed" | "incomplete" | "unpaid" | "unavailable" };

export type CheckoutSessionSnapshot = {
  id: string;
  status: string | null;
  payment_status: string | null;
  customer_email?: string | null;
  customer_details?: { email?: string | null } | null;
  created?: number | null;
};

export type StripeSessionLookup = {
  retrieve(sessionId: string): Promise<CheckoutSessionSnapshot>;
};

export function isCheckoutSessionId(
  value: string | null | undefined,
): value is string {
  return typeof value === "string" && CHECKOUT_SESSION_ID_PATTERN.test(value);
}

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

  return {
    ok: true,
    payment: {
      sessionId: session.id,
      email: emailFromSession(session),
      paidAt: paidAtFromSession(session),
    },
  };
}
