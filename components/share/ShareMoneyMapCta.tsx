"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { buildInviteUrl } from "@/lib/share/referral";

const LIVE_ORIGIN = "https://www.moneyfinderapp.com";
const SHARE_TEXT =
  "Money Finder builds a personalised Money Map from your situation. Matches are not a promise of income.";

type ShareMoneyMapCtaProps = {
  inviteUrl?: string | null;
  resultUrl?: string | null;
};

function fallbackInviteUrl() {
  return buildInviteUrl(LIVE_ORIGIN, null);
}

function resolveShareUrl(
  inviteUrl: string | null,
  resultUrl: string | null,
): string {
  if (inviteUrl) {
    return inviteUrl;
  }
  if (resultUrl) {
    return resultUrl;
  }
  if (typeof window === "undefined") {
    return fallbackInviteUrl();
  }
  return buildInviteUrl(window.location.origin, null);
}

export function ShareMoneyMapCta({
  inviteUrl = null,
  resultUrl = null,
}: ShareMoneyMapCtaProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(
    inviteUrl || resultUrl || fallbackInviteUrl(),
  );

  useEffect(() => {
    setShareUrl(resolveShareUrl(inviteUrl, resultUrl));
  }, [inviteUrl, resultUrl]);

  async function shareMoneyFinder() {
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share({
          title: "Money Finder",
          text: SHARE_TEXT,
          url: shareUrl,
        });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <aside className="rounded-3xl border border-line bg-cream/70 px-6 py-8">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-copper">
        Share Money Finder
      </p>
      <h2 className="mt-2 font-display text-2xl tracking-tight">
        Pass this on
      </h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">
        Share the Money Finder homepage. Recipients start their own assessment.
        This does not track clicks, issue rewards, or require an account.
      </p>
      <p className="mt-4 break-all text-sm text-muted">{shareUrl}</p>
      <Button
        type="button"
        className="mt-6"
        onClick={() => {
          void shareMoneyFinder();
        }}
      >
        {copied ? "Link copied" : "Share Money Finder"}
      </Button>
    </aside>
  );
}
