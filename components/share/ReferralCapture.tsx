"use client";

import { useEffect } from "react";
import {
  parseReferralFromSearch,
  REFERRAL_STORAGE_KEY,
  serializeReferral,
} from "@/lib/share/referral";

/**
 * Optional, fail-open capture of ?ref= / ?share= on the landing page.
 * Results and assessment do not depend on this component.
 */
export function ReferralCapture() {
  useEffect(() => {
    try {
      const captured = parseReferralFromSearch(window.location.search);
      if (!captured.referralCode && !captured.sourceShareId) {
        return;
      }

      window.sessionStorage.setItem(
        REFERRAL_STORAGE_KEY,
        serializeReferral(captured),
      );
    } catch {
      // Attribution is optional. Never block the landing page.
    }
  }, []);

  return null;
}
