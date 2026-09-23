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
  { href: "/#how-it-works", label: "How it works", showOnMobile: false },
  { href: "/assessment", label: "Assessment", showOnMobile: true },
] as const;

type SiteHeaderProps = {
  startHref: string;
  paymentLinked: boolean;
};

export function SiteHeader({ startHref, paymentLinked }: SiteHeaderProps) {
  const pathname = usePathname() ?? "";
  const onResults =
    pathname === "/results" || pathname.startsWith("/results/");
  const ctaHref = onResults ? ASSESSMENT_RETAKE_HREF : startHref;
  const ctaLabel = onResults
    ? "Retake assessment"
    : paymentLinked
      ? "Find My Money Map"
      : "Start the assessment";

  return (
    <header className="border-b border-line/80">
      <Container className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center"
            aria-label="Money Finder home"
          >
            <Image
              src="/assets/branding/image_eT-ENo.png"
              alt="Money Finder"
              width={512}
              height={512}
              className="h-32 w-auto max-h-32 sm:h-36 sm:max-h-36"
              style={{
                width: "auto",
                height: "auto",
                maxHeight: 144,
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
              }}
              sizes="(min-width: 640px) 144px, 128px"
              unoptimized
              priority
            />
          </Link>
          <div className="sm:hidden">
            <Button href={ctaHref} size="sm">
              {ctaLabel}
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-6 sm:justify-end">
          <nav aria-label="Primary">
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
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
                    className={item.showOnMobile ? undefined : "hidden sm:list-item"}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "inline-flex min-h-11 items-center border-b-2",
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
          <div className="hidden sm:block">
            <Button href={ctaHref} size="sm">
              {ctaLabel}
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
