"use client";

import type { ReactNode, MouseEvent } from "react";
import { sendAnalyticsEvent } from "@/lib/analytics";
import { track } from "@vercel/analytics";

export function PaymentClickTracker({ children, tier, location }: {
  children: ReactNode;
  tier: "standard" | "premium";
  location: string;
}) {
  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest("a");
    // Demo assessment links are not payment clicks. Never send the URL or answers.
    if (!anchor || !anchor.href.startsWith("https://")) return;
    sendAnalyticsEvent("begin_checkout", {
      currency: "AUD",
      value: tier === "premium" ? 97 : 47,
      tier,
      location,
      items: [{ item_id: tier, item_name: `${tier} Money Map`, price: tier === "premium" ? 97 : 47, quantity: 1 }],
    });
    try {
      track("payment_button_click", { tier, location });
    } catch {
      // Analytics must never prevent navigation to checkout.
    }
  }
  return <div onClick={handleClick}>{children}</div>;
}
