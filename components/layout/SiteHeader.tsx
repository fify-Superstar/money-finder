"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/cn";
import { ASSESSMENT_RETAKE_HREF } from "@/lib/assessment/persist";

const navItems = [
  { href: "/", label: "Home", showOnMobile: true },
  { href: "/#how-it-works", label: "How it works", showOnMobile: true },
  { href: "/assessment", label: "Assessment", showOnMobile: true },
  { href: "/#share-money-finder", label: "Share", showOnMobile: true },
] as const;

type SiteHeaderProps = {
  startHref: string;
  paymentLinked: boolean;
};

export function SiteHeader({ startHref, paymentLinked }: SiteHeaderProps) {
  const pathname = usePathname() ?? "";
  const onResults = pathname === "/results" || pathname.startsWith("/results/");
  const ctaHref = onResults ? ASSESSMENT_RETAKE_HREF : startHref;
  const ctaLabel = onResults
    ? "Retake assessment"
    : paymentLinked
      ? "Find My Money Map"
      : "Start the assessment";

  return (
    <header
      className={cn(
        "border-b border-line/80 lg:sticky lg:top-0 z-40",
        "premium-shell",
      )}
    >
      <Container className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between sm:py-3">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3"
            aria-label="Money Finder home"
          >
            <Image
              src="/assets/branding/image_eT-ENo.png"
              alt="Money Finder"
              width={512}
              height={512}
              className="h-16 w-16 object-contain sm:h-20 sm:w-20"
              style={{
                width: "auto",
                height: "auto",
                maxHeight: 80,
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
              }}
              sizes="(min-width: 640px) 80px, 64px"
              unoptimized
              priority
            />
            <span className="text-lg font-medium tracking-tight sm:text-xl">
              Money Finder
              <span className="block text-[9px] font-normal uppercase tracking-[0.18em] text-muted">
                Your personalised Money Map
              </span>
            </span>
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">
          <nav aria-label="Primary" className="site-navigation">
            <ul className="flex flex-wrap gap-1 text-sm">
              {navItems.map((item) => {
                const pathOnly = item.href.split("#")[0] || "/";
                const current =
                  pathOnly === "/"
                    ? pathname === "/" && !item.href.includes("#")
                    : pathname === pathOnly ||
                      pathname.startsWith(`${pathOnly}/`);

                return (
                  <li
                    key={item.href}
                    className={
                      item.showOnMobile ? undefined : "hidden sm:list-item"
                    }
                  >
                    <Link
                      prefetch={false}
                      href={item.href}
                      className={cn(
                        "inline-flex min-h-11 items-center",
                        current
                          ? "border-moss font-medium text-ink"
                          : "border-transparent text-muted hover:text-ink",
                      )}
                      aria-current={current ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="block">
            <Button href={ctaHref} size="sm">
              {ctaLabel}
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
