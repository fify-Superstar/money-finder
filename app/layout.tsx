import type { Metadata } from "next";
import { Newsreader, Outfit } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
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
    "A one-time A$19 assessment that matches your situation to a personalised Top 3 Money Map. No subscription.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-AU"
      className={`${outfit.variable} ${newsreader.variable} h-full`}
    >
      <body className="min-h-dvh bg-paper font-sans text-ink antialiased">
        <div className="flex min-h-dvh flex-col">
          <SkipLink />
          <SiteHeader />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
