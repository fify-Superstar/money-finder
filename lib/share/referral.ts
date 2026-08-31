export const REFERRAL_STORAGE_KEY = "money-finder-v10.referral";
export const SHARE_QUERY_PARAM = "share";
export const REFERRAL_QUERY_PARAM = "ref";

export type ReferralAttribution = {
  version: 1;
  referralCode: string | null;
  sourceShareId: string | null;
  capturedAt: string | null;
};

export type ShareableResult = {
  shareId: string | null;
  url: string | null;
};

export function emptyReferralAttribution(): ReferralAttribution {
  return {
    version: 1,
    referralCode: null,
    sourceShareId: null,
    capturedAt: null,
  };
}

export function parseReferralFromSearch(search: string): ReferralAttribution {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  const referralCode = params.get(REFERRAL_QUERY_PARAM);
  const sourceShareId = params.get(SHARE_QUERY_PARAM);

  if (!referralCode && !sourceShareId) {
    return emptyReferralAttribution();
  }

  return {
    version: 1,
    referralCode,
    sourceShareId,
    capturedAt: new Date().toISOString(),
  };
}

export function buildShareableResultUrl(
  origin: string,
  shareId: string | null,
): string | null {
  if (!shareId) {
    return null;
  }

  const url = new URL("/results", origin);
  url.searchParams.set(SHARE_QUERY_PARAM, shareId);
  return url.toString();
}

export function buildInviteUrl(
  origin: string,
  referralCode: string | null,
): string {
  const url = new URL("/", origin);
  if (referralCode) {
    url.searchParams.set(REFERRAL_QUERY_PARAM, referralCode);
  }
  return url.toString();
}

export function serializeReferral(record: ReferralAttribution): string {
  return JSON.stringify(record);
}

export function parseStoredReferral(raw: string): ReferralAttribution | null {
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

    const record = parsed as ReferralAttribution;
    return {
      version: 1,
      referralCode:
        typeof record.referralCode === "string" ? record.referralCode : null,
      sourceShareId:
        typeof record.sourceShareId === "string" ? record.sourceShareId : null,
      capturedAt:
        typeof record.capturedAt === "string" ? record.capturedAt : null,
    };
  } catch {
    return null;
  }
}
