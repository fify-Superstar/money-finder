import {
  ACCESS_COOKIE_NAME,
  readAccessSigningSecret,
  verifyAccessToken,
} from "./accessCookie.ts";
import { type EnvLike } from "./handoff.ts";
import { isCheckoutSessionId } from "./sessionId.ts";

export function isProtectedPath(pathname: string): boolean {
  return (
    pathname === "/assessment" ||
    pathname.startsWith("/assessment/") ||
    pathname === "/results" ||
    pathname.startsWith("/results/")
  );
}

export function readAccessCookieValue(
  cookieHeader: string | null | undefined,
): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const name = trimmed.slice(0, separator);
    if (name === ACCESS_COOKIE_NAME) {
      try {
        return decodeURIComponent(trimmed.slice(separator + 1));
      } catch {
        return undefined;
      }
    }
  }

  return undefined;
}

export async function hasValidAccessCookie(
  cookieHeader: string | null | undefined,
  env: EnvLike = process.env,
  nowMs: number = Date.now(),
): Promise<boolean> {
  const secret = readAccessSigningSecret(env);
  const token = readAccessCookieValue(cookieHeader);
  return (await verifyAccessToken(token, secret, nowMs)) !== null;
}

/**
 * Stripe may return the customer to /assessment with session_id.
 * Send that through /success so the access cookie can be issued
 * instead of dropping them on /.
 */
export function checkoutReturnPath(
  pathname: string,
  sessionId: string | null | undefined,
): string | null {
  if (!isProtectedPath(pathname)) {
    return null;
  }

  const id = sessionId?.trim() ?? "";
  if (!isCheckoutSessionId(id)) {
    return null;
  }

  return `/success?session_id=${encodeURIComponent(id)}`;
}

/** Paid routes always require a valid signed entitlement, even if checkout configuration is missing. */
export async function allowProtectedRequest(
  pathname: string,
  cookieHeader: string | null | undefined,
  env: EnvLike = process.env,
  nowMs: number = Date.now(),
): Promise<boolean> {
  if (!isProtectedPath(pathname)) {
    return true;
  }

  return hasValidAccessCookie(cookieHeader, env, nowMs);
}
