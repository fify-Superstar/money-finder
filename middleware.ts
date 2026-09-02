import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { allowProtectedRequest } from "@/lib/payment/gate";

export async function middleware(request: NextRequest) {
  const allowed = await allowProtectedRequest(
    request.nextUrl.pathname,
    request.headers.get("cookie"),
  );

  if (!allowed) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/assessment", "/assessment/:path*", "/results", "/results/:path*"],
};
