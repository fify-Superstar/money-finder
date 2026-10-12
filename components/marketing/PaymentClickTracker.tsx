"use client";

import type { ReactNode, MouseEvent } from "react";
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
    try {
      track("payment_button_click", { tier, location });
    } catch {
      // Analytics must never prevent navigation to checkout.
    }
  }
  return <div onClick={handleClick}>{children}</div>;
}
