import type { Metadata } from "next";
import Link from "next/link";
import { Newsreader, Outfit } from "next/font/google";
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
          <header className="border-b border-line/80">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
              <Link href="/" className="group">
                <p className="font-display text-lg tracking-tight text-ink">
                  Money Finder
                </p>
                <p className="text-xs tracking-wide text-muted">
                  Personalised Money Map
                </p>
              </Link>
              <Link
                href="/assessment"
                className="rounded-full bg-moss px-4 py-2 text-sm font-medium text-cream transition hover:bg-moss-dark"
              >
                Find My Money Map
              </Link>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-line/80">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-5 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p>Money Finder · A$19 one-time · No subscription</p>
              <p>Results are personalised matches, not guaranteed income.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
