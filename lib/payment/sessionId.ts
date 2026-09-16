export const CHECKOUT_SESSION_ID_PATTERN = /^cs_(test|live)_[A-Za-z0-9]+$/;

export function isCheckoutSessionId(
  value: string | null | undefined,
): value is string {
  return typeof value === "string" && CHECKOUT_SESSION_ID_PATTERN.test(value);
}
