/**
 * Stripe Payment Link handoff.
 *
 * Intended customer journey once a Payment Link is supplied in env:
 *   /  → Stripe Payment Link → /success?session_id=… → /assessment → /results
 *
 * Access is granted only after server-side Stripe verification on /success.
 * Do not treat query parameters, React state, or sessionStorage as proof of payment.
 * Do not put secret keys in this file.
 */

export const PAYMENT_SUCCESS_PATH = "/success";
export const POST_PAYMENT_CONTINUE_PATH = "/assessment";
export const RESULTS_PATH = "/results";
export const PAYMENT_CANCEL_PATH = "/";

export type EnvLike = Record<string, string | undefined>;

export type StripePaymentHandoffConfig = {
  /** Public Payment Link URL from env. Null means checkout is not connected. */
  paymentLinkUrl: string | null;
  successPath: typeof PAYMENT_SUCCESS_PATH;
  cancelPath: typeof PAYMENT_CANCEL_PATH;
  postPaymentContinuePath: typeof POST_PAYMENT_CONTINUE_PATH;
  resultsPath: typeof RESULTS_PATH;
};

export function readPaymentLinkUrl(
  env: EnvLike = process.env,
): string | null {
  const raw = env.STRIPE_PAYMENT_LINK_URL?.trim() ?? "";
  if (!raw) {
    return null;
  }

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") {
      return null;
    }
    return raw;
  } catch {
    return null;
  }
}

export function getStripeHandoffConfig(
  env: EnvLike = process.env,
): StripePaymentHandoffConfig {
  return {
    paymentLinkUrl: readPaymentLinkUrl(env),
    successPath: PAYMENT_SUCCESS_PATH,
    cancelPath: PAYMENT_CANCEL_PATH,
    postPaymentContinuePath: POST_PAYMENT_CONTINUE_PATH,
    resultsPath: RESULTS_PATH,
  };
}

/**
 * Live config from process.env. The Payment Link is never hardcoded.
 */
export const stripeHandoff: StripePaymentHandoffConfig = {
  successPath: PAYMENT_SUCCESS_PATH,
  cancelPath: PAYMENT_CANCEL_PATH,
  postPaymentContinuePath: POST_PAYMENT_CONTINUE_PATH,
  resultsPath: RESULTS_PATH,
  get paymentLinkUrl() {
    return readPaymentLinkUrl();
  },
};

/**
 * Client-side payment record helpers are not an access layer.
 * `paidAt` here is never proof that Stripe was paid.
 */
export type PaymentAccessRecord = {
  version: 1;
  source: "stripe-payment-link";
  checkoutSessionId: string | null;
  paidAt: string | null;
};

export const PAYMENT_ACCESS_STORAGE_KEY = "money-finder-v10.payment-access";

export function getCustomerStartHref(
  config: StripePaymentHandoffConfig = getStripeHandoffConfig(),
): string {
  return config.paymentLinkUrl ?? POST_PAYMENT_CONTINUE_PATH;
}

export function isPaymentLinked(
  config: StripePaymentHandoffConfig = getStripeHandoffConfig(),
): boolean {
  return Boolean(config.paymentLinkUrl);
}

export function createUnpaidAccessRecord(): PaymentAccessRecord {
  return {
    version: 1,
    source: "stripe-payment-link",
    checkoutSessionId: null,
    paidAt: null,
  };
}

export function serializePaymentAccess(record: PaymentAccessRecord): string {
  return JSON.stringify(record);
}

export function parsePaymentAccess(raw: string): PaymentAccessRecord | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("version" in parsed) ||
      parsed.version !== 1
    ) {
      return null;
    }

    const record = parsed as PaymentAccessRecord;
    if (record.source !== "stripe-payment-link") {
      return null;
    }

    return {
      version: 1,
      source: "stripe-payment-link",
      checkoutSessionId:
        typeof record.checkoutSessionId === "string"
          ? record.checkoutSessionId
          : null,
      paidAt: typeof record.paidAt === "string" ? record.paidAt : null,
    };
  } catch {
    return null;
  }
}

export function hasRecordedPayment(record: PaymentAccessRecord | null): boolean {
  return Boolean(record?.paidAt);
}
