import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  accessCookieOptions,
  issueAccessCookieValue,
} from "@/lib/payment/accessCookie";
import { publicOriginFromRequest } from "@/lib/payment/publicOrigin";
import { verifyPaidCheckoutSession } from "@/lib/payment/verifySession";

export const runtime = "nodejs";

function originFromRequest(request: Request): string {
  return publicOriginFromRequest(
    request.url,
    {
      host: request.headers.get("host"),
      forwardedHost: request.headers.get("x-forwarded-host"),
      forwardedProto: request.headers.get("x-forwarded-proto"),
    },
    process.env.APP_URL,
  );
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const sessionId = requestUrl.searchParams.get("session_id");
  const origin = originFromRequest(request);

  const verified = await verifyPaidCheckoutSession(sessionId);
  if (!verified.ok) {
    return NextResponse.redirect(new URL("/success?error=unconfirmed", origin));
  }

  let token: string;
  try {
    token = await issueAccessCookieValue(verified.payment);
  } catch {
    return NextResponse.redirect(new URL("/success?error=unconfirmed", origin));
  }

  const response = NextResponse.redirect(new URL("/success", origin));
  response.cookies.set(ACCESS_COOKIE_NAME, token, accessCookieOptions());
  return response;
}
