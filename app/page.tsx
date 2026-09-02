import { HomePage } from "@/components/marketing/HomePage";
import { getCustomerStartHref, isPaymentLinked } from "@/lib/payment/handoff";

export default function Home() {
  const paymentLinked = isPaymentLinked();
  const startHref = getCustomerStartHref();
  const ctaLabel = paymentLinked ? "Find My Money Map" : "Start the assessment";

  return (
    <HomePage
      startHref={startHref}
      ctaLabel={ctaLabel}
      paymentLinked={paymentLinked}
    />
  );
}
