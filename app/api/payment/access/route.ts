import { NextResponse } from "next/server";
import { revalidatePaidAccess } from "@/lib/payment/revalidateAccess";
import { ACCESS_COOKIE_NAME } from "@/lib/payment/accessCookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const allowed = await revalidatePaidAccess(request.headers.get("cookie"));
  const response = NextResponse.json(
    { allowed },
    {
      status: allowed ? 200 : 401,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        Vary: "Cookie",
      },
    },
  );
  if (!allowed)
    response.cookies.set(ACCESS_COOKIE_NAME, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  return response;
}
