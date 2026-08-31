import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/layout/Container";
import { POST_PAYMENT_CONTINUE_PATH } from "@/lib/payment/handoff";

export const metadata: Metadata = {
  title: "You’re in — Money Finder",
  description:
    "Payment confirmation placeholder. After Stripe Payment Link checkout, continue to the assessment.",
};

export default function SuccessPage() {
  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Payment handoff"
        title="You’re in"
        description="After a successful Stripe Payment Link checkout, this page is the return URL. Nothing has been charged."
      />
      <Card className="max-w-xl space-y-5">
        <p className="leading-relaxed text-muted">
          The next step is the assessment — not results. Connecting a live
          Payment Link later should keep this path: checkout → `/success` →
          `/assessment` → `/results`. Assessment itself stays unchanged.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href={POST_PAYMENT_CONTINUE_PATH}>
            Continue to assessment
          </Button>
          <Button href="/" variant="secondary">
            Back to home
          </Button>
        </div>
      </Card>
    </Container>
  );
}
