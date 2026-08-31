import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Success — Money Finder",
  description:
    "Placeholder confirmation after completing Money Finder. Payment is not connected yet.",
};

export default function SuccessPage() {
  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Money Finder"
        title="You’re in"
        description="This is a placeholder success screen. Stripe payment, shareable profiles, and referrals are not part of this foundation."
      />
      <Card className="max-w-xl space-y-5">
        <p className="leading-relaxed text-muted">
          After checkout, this page will confirm the A$19 one-time purchase and
          point people to their Money Map. Nothing has been charged.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/results">View results placeholder</Button>
          <Button href="/" variant="secondary">
            Back to home
          </Button>
        </div>
      </Card>
    </Container>
  );
}
