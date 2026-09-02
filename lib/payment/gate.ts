import {
  ACCESS_COOKIE_NAME,
  readAccessSigningSecret,
  verifyAccessToken,
} from "./accessCookie.ts";
import { readPaymentLinkUrl, type EnvLike } from "./handoff.ts";

export function isProtectedPath(pathname: string): boolean {
  return (
    pathname === "/assessment" ||
    pathname.startsWith("/assessment/") ||
    pathname === "/results" ||
    pathname.startsWith("/results/")
  );
}

export function isPaymentGatingEnabled(env: EnvLike = process.env): boolean {
  return Boolean(readPaymentLinkUrl(env));
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
      return decodeURIComponent(trimmed.slice(separator + 1));
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
 * Returns true when the request may proceed.
 * Demo mode (no Payment Link) stays open. Payment mode fails closed
 * without a valid signed cookie — including when the signing secret is missing.
 */
export async function allowProtectedRequest(
  pathname: string,
  cookieHeader: string | null | undefined,
  env: EnvLike = process.env,
  nowMs: number = Date.now(),
): Promise<boolean> {
  if (!isProtectedPath(pathname)) {
    return true;
  }

  if (!isPaymentGatingEnabled(env)) {
    return true;
  }

  return hasValidAccessCookie(cookieHeader, env, nowMs);
}

