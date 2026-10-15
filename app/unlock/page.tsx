import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PricingTiers } from "@/components/marketing/PricingTiers";
import {
  getCustomerStartHref,
  getCustomerPremiumStartHref,
  isPaymentLinked,
} from "@/lib/payment/handoff";

export const metadata: Metadata = {
  title: "Unlock your assessment — Money Finder",
  robots: { index: false, follow: true },
};
export default function UnlockPage() {
  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="PAID ASSESSMENT · SECURE ACCESS"
        title="Your personal Money Map starts here."
        description="Choose your Money Map below. After verified payment, you can complete your assessment and see your personal matches and scores."
      />
      <div className="mb-8 rounded-2xl border border-line bg-cream p-5 text-sm leading-relaxed text-muted">
        Already paid? Open the confirmation link from your Stripe checkout in
        the same browser. Personal results are available only with verified paid
        access. The homepage preview is a fictional example.
      </div>
      <PricingTiers
        id="pricing"
        standardHref={getCustomerStartHref()}
        premiumHref={getCustomerPremiumStartHref()}
        paymentLinked={isPaymentLinked()}
      />
    </Container>
  );
}
