"use client";

type ShareMoneyMapCtaProps = {
  inviteUrl?: string | null;
  resultUrl?: string | null;
};

export function ShareMoneyMapCta({
  inviteUrl = null,
  resultUrl = null,
}: ShareMoneyMapCtaProps) {
  const ready = Boolean(inviteUrl || resultUrl);

  return (
    <aside className="rounded-3xl border border-dashed border-line bg-cream/70 px-6 py-8">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-copper">
        Share Money Finder
      </p>
      <h2 className="mt-2 font-display text-2xl tracking-tight">
        Pass this on
      </h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">
        A shareable Money Map link and referral identifier will live here later.
        Recipients will start their own assessment — this placeholder does not
        track clicks, issue rewards, or require an account.
      </p>
      <p className="mt-4 text-sm text-muted">
        {ready
          ? "A referral code is prepared, but sharing is not live yet."
          : "No share identifier has been issued yet."}
      </p>
      <button
        type="button"
        disabled
        className="mt-6 inline-flex min-h-11 cursor-not-allowed items-center rounded-full bg-moss/40 px-6 py-3 font-medium text-cream"
      >
        Share Money Map
      </button>
    </aside>
  );
}
