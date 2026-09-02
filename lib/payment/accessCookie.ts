import type { EnvLike } from "./handoff.ts";
import type { VerifiedPayment } from "./verifySession.ts";

export const ACCESS_COOKIE_NAME = "mf_paid_access";
export const ACCESS_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const TOKEN_VERSION = "v1";

export type AccessCookiePayload = {
  sessionId: string;
  email: string | null;
  issuedAt: number;
  expiresAt: number;
};

export function accessCookieOptions(nowEnv: NodeJS.ProcessEnv = process.env): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: nowEnv.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_COOKIE_MAX_AGE_SECONDS,
  };
}

export function readAccessSigningSecret(
  env: EnvLike = process.env,
): string | null {
  const secret = env.PAYMENT_ACCESS_SECRET?.trim() ?? "";
  return secret || null;
}

export function requireAccessSigningSecret(
  env: EnvLike = process.env,
): string {
  const secret = readAccessSigningSecret(env);
  if (secret) {
    return secret;
  }

  if (env.NODE_ENV === "production") {
    throw new Error(
      "PAYMENT_ACCESS_SECRET is required in production; refusing to use a default secret",
    );
  }

  throw new Error(
    "PAYMENT_ACCESS_SECRET is required to sign access cookies; refusing to use a default secret",
  );
}

export function createAccessPayload(
  payment: VerifiedPayment,
  nowMs: number = Date.now(),
): AccessCookiePayload {
  return {
    sessionId: payment.sessionId,
    email: payment.email,
    issuedAt: nowMs,
    expiresAt: nowMs + ACCESS_COOKIE_MAX_AGE_SECONDS * 1000,
  };
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + "=".repeat(padLength));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function utf8ToBase64Url(value: string): string {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function base64UrlToUtf8(value: string): string {
  return new TextDecoder().decode(base64UrlToBytes(value));
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left[i]! ^ right[i]!;
  }
  return diff === 0;
}

async function hmacSha256Base64Url(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function signAccessToken(
  payload: AccessCookiePayload,
  secret: string,
): Promise<string> {
  if (!secret) {
    throw new Error(
      "PAYMENT_ACCESS_SECRET is required to sign access cookies; refusing to use a default secret",
    );
  }

  const body = utf8ToBase64Url(JSON.stringify(payload));
  const message = `${TOKEN_VERSION}.${body}`;
  const signature = await hmacSha256Base64Url(secret, message);
  return `${message}.${signature}`;
}

export async function verifyAccessToken(
  token: string | undefined,
  secret: string | null,
  nowMs: number = Date.now(),
): Promise<AccessCookiePayload | null> {
  if (!token || !secret) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [version, body, signature] = parts;
  if (version !== TOKEN_VERSION || !body || !signature) {
    return null;
  }

  const message = `${version}.${body}`;
  const expected = await hmacSha256Base64Url(secret, message);
  if (!timingSafeEqual(base64UrlToBytes(signature), base64UrlToBytes(expected))) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(base64UrlToUtf8(body));
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const candidate = parsed as Partial<AccessCookiePayload>;
    if (typeof candidate.sessionId !== "string" || !candidate.sessionId) {
      return null;
    }
    if (candidate.email !== null && typeof candidate.email !== "string") {
      return null;
    }
    if (
      typeof candidate.issuedAt !== "number" ||
      typeof candidate.expiresAt !== "number"
    ) {
      return null;
    }
    if (candidate.expiresAt <= nowMs) {
      return null;
    }

    return {
      sessionId: candidate.sessionId,
      email: candidate.email ?? null,
      issuedAt: candidate.issuedAt,
      expiresAt: candidate.expiresAt,
    };
  } catch {
    return null;
  }
}

export async function issueAccessCookieValue(
  payment: VerifiedPayment,
  env: EnvLike = process.env,
  nowMs: number = Date.now(),
): Promise<string> {
  const secret = requireAccessSigningSecret(env);
  return signAccessToken(createAccessPayload(payment, nowMs), secret);
}
