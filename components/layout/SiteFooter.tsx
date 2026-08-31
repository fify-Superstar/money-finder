import { Container } from "@/components/layout/Container";

export function SiteFooter() {
  return (
    <footer className="border-t border-line/80">
      <Container className="flex flex-col gap-2 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Money Finder · A$19 one-time · No subscription</p>
        <p>Results are personalised matches, not guaranteed income.</p>
      </Container>
    </footer>
  );
}
