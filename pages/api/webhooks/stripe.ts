import type { IncomingMessage } from "node:http";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  STRIPE_CHECKOUT_WEBHOOK_API_VERSION,
  handleCheckoutSessionWebhook,
} from "@/lib/payment/checkoutWebhook";

/** Stripe Checkout webhook schema: 2026-07-29.dahlia */
export const config = {
  api: {
    bodyParser: false,
  },
};

type WebhookResponse = {
  error?: string;
  received?: boolean;
  apiVersion?: string;
};

async function readRawBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WebhookResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const signature = req.headers["stripe-signature"];
  const signatureHeader = Array.isArray(signature) ? signature[0] : signature;
  const rawBody = await readRawBody(req);

  const result = await handleCheckoutSessionWebhook(
    rawBody,
    signatureHeader ?? null,
    process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? null,
  );

  return res.status(result.status).json({
    ...result.body,
    apiVersion: STRIPE_CHECKOUT_WEBHOOK_API_VERSION,
  });
}
