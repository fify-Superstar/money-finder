/**
 * Stripe Payment Link handoff — interface only.
 * Do not put secret keys, webhooks, or live Stripe SDK calls here.
 *
 * Intended customer journey once a Payment Link is supplied:
 *   /  → Stripe Payment Link → /success → /assessment → /results
 *
 * Assessment stays payment-agnostic. Access is recorded on /success later,
 * then the existing assessment route is used unchanged.
 */

export const PAYMENT_SUCCESS_PATH = "/success";
export const POST_PAYMENT_CONTINUE_PATH = "/assessment";
export const RESULTS_PATH = "/results";
export const PAYMENT_CANCEL_PATH = "/";

export type StripePaymentHandoffConfig = {
  /** Public Payment Link URL. Null means checkout is not connected. */
  paymentLinkUrl: string | null;
  successPath: typeof PAYMENT_SUCCESS_PATH;
  cancelPath: typeof PAYMENT_CANCEL_PATH;
  postPaymentContinuePath: typeof POST_PAYMENT_CONTINUE_PATH;
  resultsPath: typeof RESULTS_PATH;
};

export const stripeHandoff: StripePaymentHandoffConfig = {
  paymentLinkUrl: null,
  successPath: PAYMENT_SUCCESS_PATH,
  cancelPath: PAYMENT_CANCEL_PATH,
  postPaymentContinuePath: POST_PAYMENT_CONTINUE_PATH,
  resultsPath: RESULTS_PATH,
};

export type PaymentAccessRecord = {
  version: 1;
  source: "stripe-payment-link";
  checkoutSessionId: string | null;
  paidAt: string | null;
};

export const PAYMENT_ACCESS_STORAGE_KEY = "money-finder-v10.payment-access";

export function getCustomerStartHref(
  config: StripePaymentHandoffConfig = stripeHandoff,
): string {
  return config.paymentLinkUrl ?? POST_PAYMENT_CONTINUE_PATH;
}

export function isPaymentLinked(
  config: StripePaymentHandoffConfig = stripeHandoff,
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
