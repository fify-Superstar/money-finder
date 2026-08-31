"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/cn";
import { getCustomerStartHref } from "@/lib/payment/handoff";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/assessment", label: "Assessment" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const startHref = getCustomerStartHref();

  return (
    <header className="border-b border-line/80">
      <Container className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="min-h-11">
            <p className="font-display text-lg tracking-tight text-ink">
              Money Finder
            </p>
            <p className="text-xs tracking-wide text-muted">
              Personalised Money Map
            </p>
          </Link>
          <div className="sm:hidden">
            <Button href={startHref} size="sm">
              Find My Money Map
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-6 sm:justify-end">
          <nav aria-label="Primary">
            <ul className="flex gap-5 text-sm">
              {navItems.map((item) => {
                const current =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                return (
                  <li key={item.href}>
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
            <Button href={startHref} size="sm">
              Find My Money Map
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
