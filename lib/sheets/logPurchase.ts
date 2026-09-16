/**
 * Appends a paid checkout row to the Google Sheets purchase log.
 *
 * Does not open or write the V9 matching workbook. Destination is only the
 * HTTPS logger configured in GOOGLE_SHEETS_LOG_URL.
 */

import type { PaidProductTier } from "../payment/verifySession.ts";

export type { PaidProductTier };

export type PurchaseLogRecord = {
  loggedAt: string;
  eventId: string;
  sessionId: string;
  email: string | null;
  amountTotal: number;
  currency: string;
  productTier: PaidProductTier;
  productLabel: "A$19 Standard" | "A$49 Premium";
  paymentStatus: string;
};

export type PurchaseLogResult =
  | { ok: true; skipped?: boolean }
  | { ok: false; reason: "invalid_log_url" | "sheets_rejected" | "sheets_unavailable" };

export type EnvLike = Record<string, string | undefined>;

export type FetchLike = (
  input: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body: string;
  },
) => Promise<{ ok: boolean }>;

export const PRODUCT_TIER_LABEL: Record<
  PaidProductTier,
  PurchaseLogRecord["productLabel"]
> = {
  standard: "A$19 Standard",
  premium: "A$49 Premium",
};

function readHttpsLogUrl(env: EnvLike): string | null {
  const raw = env.GOOGLE_SHEETS_LOG_URL?.trim() ?? "";
  if (!raw) {
    return null;
  }

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export async function logPurchaseToGoogleSheet(
  record: PurchaseLogRecord,
  env: EnvLike = process.env,
  fetchImpl: FetchLike = fetch,
): Promise<PurchaseLogResult> {
  const url = readHttpsLogUrl(env);
  if (!url) {
    const configured = env.GOOGLE_SHEETS_LOG_URL?.trim() ?? "";
    if (configured) {
      return { ok: false, reason: "invalid_log_url" };
    }
    return { ok: true, skipped: true };
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  const token = env.GOOGLE_SHEETS_LOG_TOKEN?.trim() ?? "";
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers,
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      return { ok: false, reason: "sheets_rejected" };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "sheets_unavailable" };
  }
}
