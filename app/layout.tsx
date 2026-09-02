import type { Metadata } from "next";
import { Newsreader, Outfit } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import { getCustomerStartHref, isPaymentLinked } from "@/lib/payment/handoff";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Money Finder — Personalised Money Map",
  description:
    "A personalised Money Map of income opportunities based on your skills, time, budget and goals. Ranked fits, not a promise of income.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const startHref = getCustomerStartHref();
  const paymentLinked = isPaymentLinked();

  return (
    <html
      lang="en-AU"
      className={`${outfit.variable} ${newsreader.variable} h-full`}
    >
      <body className="min-h-dvh bg-paper font-sans text-ink antialiased">
        <div className="flex min-h-dvh flex-col">
          <SkipLink />
          <SiteHeader startHref={startHref} paymentLinked={paymentLinked} />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <SiteFooter paymentLinked={paymentLinked} />
        </div>
      </body>
    </html>
  );
}
