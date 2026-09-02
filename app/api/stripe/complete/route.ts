import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  accessCookieOptions,
  issueAccessCookieValue,
} from "@/lib/payment/accessCookie";
import { verifyPaidCheckoutSession } from "@/lib/payment/verifySession";

export const runtime = "nodejs";

function originFromRequest(request: Request): string {
  const configured = process.env.APP_URL?.trim();
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // Fall through to the incoming request origin.
    }
  }

  return new URL(request.url).origin;
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
