"use client";

import { useEffect } from "react";
import { sendAnalyticsEvent } from "@/lib/analytics";

const sent = new Set<string>();

export function PurchaseTracker({ transactionId, value }: { transactionId: string; value: number }) {
  useEffect(() => {
    const key = `mf_purchase_${transactionId}`;
    if (sent.has(key)) return;
    try {
      if (localStorage.getItem(key)) return;
    } catch { /* Continue with in-memory and GA transaction deduplication. */ }
    sent.add(key);
    const tier = value === 97 ? "premium" : "standard";
    sendAnalyticsEvent("purchase", {
      transaction_id: transactionId,
      currency: "AUD",
      value,
      items: [{ item_id: tier, item_name: `${tier} Money Map`, price: value, quantity: 1 }],
    });
    try { localStorage.setItem(key, "1"); } catch { /* Storage may be disabled. */ }
  }, [transactionId, value]);
  return null;
}
