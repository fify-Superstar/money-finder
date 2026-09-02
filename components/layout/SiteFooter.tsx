import Link from "next/link";
import { Container } from "@/components/layout/Container";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/assessment", label: "Assessment" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export function SiteFooter({ paymentLinked = false }: { paymentLinked?: boolean }) {
  return (
    <footer className="border-t border-line/80">
      <Container className="flex flex-col gap-5 py-8 text-sm text-muted">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-medium text-ink">
              {paymentLinked ? "Money Finder" : "Money Finder · Pre-launch demo"}
            </p>
            <p className="mt-2 max-w-md leading-relaxed">
              These are ranked fits based on your answers, not a promise of
              income.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
