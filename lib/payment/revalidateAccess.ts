import { readAccessCookieValue } from "./gate.ts";
import { readAccessSigningSecret, verifyAccessToken } from "./accessCookie.ts";
import {
  verifyPaidCheckoutSession,
  type StripeSessionLookup,
} from "./verifySession.ts";
import type { EnvLike } from "./handoff.ts";

/** A signed browser token identifies a checkout; Stripe remains the authority. */
export async function revalidatePaidAccess(
  cookieHeader: string | null | undefined,
  lookup?: StripeSessionLookup,
  env: EnvLike = process.env,
  nowMs = Date.now(),
): Promise<boolean> {
  const access = await verifyAccessToken(
    readAccessCookieValue(cookieHeader),
    readAccessSigningSecret(env),
    nowMs,
  );
  if (!access) return false;
  if (env.NODE_ENV === "production" && !access.sessionId.startsWith("cs_live_"))
    return false;
  const payment = await verifyPaidCheckoutSession(access.sessionId, lookup);
  return payment.ok && payment.payment.sessionId === access.sessionId;
}
