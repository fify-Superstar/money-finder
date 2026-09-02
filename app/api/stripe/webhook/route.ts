import { NextResponse } from "next/server";
import { handleStripeWebhook } from "@/lib/payment/webhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();
  const result = handleStripeWebhook(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? null,
  );

  return NextResponse.json(result.body, { status: result.status });
}
