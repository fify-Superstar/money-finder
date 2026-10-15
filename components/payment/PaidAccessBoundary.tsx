"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LoadingState } from "@/components/ui/LoadingState";

/** Recheck cached client navigations and browser history restorations before showing paid UI. */
export function PaidAccessBoundary({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    async function check() {
      setAllowed(false);
      try {
        const response = await fetch("/api/payment/access", {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!active) return;
        if (!response.ok || data.allowed !== true) {
          window.location.replace("/unlock");
          return;
        }
        setAllowed(true);
      } catch {
        if (active) window.location.replace("/unlock");
      }
    }
    function restore() {
      void check();
    }
    function visibility() {
      if (document.visibilityState === "visible") void check();
    }
    void check();
    window.addEventListener("pageshow", restore);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      active = false;
      controller.abort();
      window.removeEventListener("pageshow", restore);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return allowed ? (
    children
  ) : (
    <LoadingState label="Verifying your paid access" />
  );
}
