/**
 * Host used for post-payment redirects and Set-Cookie.
 * Prefer the host the browser actually used so the access cookie is not
 * issued on APP_URL (localhost or a different Vercel alias).
 */
export function publicOriginFromRequest(
  requestUrl: string,
  headers: {
    host?: string | null;
    forwardedHost?: string | null;
    forwardedProto?: string | null;
  },
  appUrl?: string | null,
): string {
  const forwardedHost = headers.forwardedHost?.split(",")[0]?.trim();
  const host = forwardedHost || headers.host?.split(",")[0]?.trim() || "";
  const proto = (
    headers.forwardedProto?.split(",")[0]?.trim() ||
    (host ? "https" : "")
  ).replace(/:$/, "");

  if (host && proto) {
    return `${proto}://${host}`;
  }

  try {
    return new URL(requestUrl).origin;
  } catch {
    // Fall through to APP_URL only if the request URL is unusable.
  }

  const configured = appUrl?.trim() ?? "";
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // Ignore invalid APP_URL.
    }
  }

  return new URL(requestUrl).origin;
}
