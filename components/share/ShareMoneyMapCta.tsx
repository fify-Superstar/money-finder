"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { publicShareUrl, SHARE_TEXT, socialShareLinks } from "@/lib/share/social";

type ShareMoneyMapCtaProps = {
  inviteUrl?: string | null;
  /** Kept for callers; private result URLs are never shared. */
  resultUrl?: string | null;
};

export function ShareMoneyMapCta({ inviteUrl = null }: ShareMoneyMapCtaProps) {
  const shareUrl = publicShareUrl(inviteUrl);
  const [status, setStatus] = useState("");
  const [manualCopy, setManualCopy] = useState("");
  const copyField = useRef<HTMLTextAreaElement>(null);

  async function copy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(message);
      setManualCopy("");
    } catch {
      setManualCopy(text);
      setStatus("Select the text below and copy it.");
    }
  }

  async function shareMore() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Money Finder", text: SHARE_TEXT, url: shareUrl });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await copy(shareUrl, "Link copied. Paste it into your favourite app.");
  }

  return (
    <aside id="share-money-finder" className="rounded-3xl border border-line bg-cream/70 px-6 py-8">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-copper">Share Money Finder</p>
      <h2 className="mt-2 font-display text-2xl tracking-tight">Know someone looking for a starting point?</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">
        Send them Money Finder so they can explore their own fit. Your answers,
        payment details and personal results stay private.
      </p>
      <div className="mt-6 flex flex-wrap gap-3" aria-label="Share on social media">
        {socialShareLinks(inviteUrl).map(({ name, href }) => (
          <a key={name} href={href} target="_blank" rel="noopener noreferrer"
            aria-label={`Share Money Finder on ${name} (opens a new tab)`}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-white px-5 py-3 text-sm font-medium text-ink transition hover:border-moss hover:text-moss focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss">
            {name}
          </a>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="button" onClick={() => void copy(shareUrl, "Link copied.")}>Copy link</Button>
        <Button type="button" variant="secondary" onClick={() => void copy(`${SHARE_TEXT}\n\n${shareUrl}`, "Caption and link copied.")}>Copy caption</Button>
        <Button type="button" variant="secondary" onClick={() => void shareMore()}>More apps</Button>
        <a href="/opengraph-image" download="Money-Finder-share.png"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-white px-6 py-3 font-medium text-ink hover:border-moss focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss">
          Download share image
        </a>
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        Instagram or Messenger? Download the image, copy the caption, then add them
        in your app. For Instagram Stories, add a link sticker to moneyfinderapp.com.
      </p>
      <p className="mt-3 break-all text-sm text-muted">{shareUrl}</p>
      <p role="status" aria-live="polite" className="mt-3 text-sm text-moss">{status}</p>
      {manualCopy ? (
        <label className="mt-3 block text-sm">
          Copy this text
          <textarea ref={copyField} readOnly value={manualCopy} rows={4}
            onFocus={() => copyField.current?.select()}
            className="mt-2 w-full rounded-xl border border-line bg-white p-3" />
        </label>
      ) : null}
    </aside>
  );
}
