export const PUBLIC_SHARE_URL = "https://www.moneyfinderapp.com/";
export const SHARE_TEXT = "Not sure which income idea fits your time, skills and budget? Money Finder creates your personalised Top 3 with practical first steps. Ranked fits, not a promise of income.";

/** Only the public homepage and an optional referral code may leave the site. */
export function publicShareUrl(inviteUrl?: string | null): string {
  try {
    const invite = new URL(inviteUrl ?? PUBLIC_SHARE_URL);
    const safe = new URL(PUBLIC_SHARE_URL);
    if (invite.origin === safe.origin && invite.pathname === "/") {
      const ref = invite.searchParams.get("ref");
      if (ref && /^[a-zA-Z0-9_-]{1,80}$/.test(ref)) safe.searchParams.set("ref", ref);
    }
    return safe.toString();
  } catch {
    return PUBLIC_SHARE_URL;
  }
}

export function socialShareLinks(inviteUrl?: string | null) {
  const url = publicShareUrl(inviteUrl);
  const encoded = encodeURIComponent(url);
  return [
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}` },
    { name: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT}\n${url}`)}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}` },
    { name: "X", href: `https://x.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encoded}` },
  ];
}
