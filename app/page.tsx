import { HomePage } from "@/components/marketing/HomePage";
import {
  getCustomerPremiumStartHref,
  getCustomerStartHref,
  isPaymentLinked,
} from "@/lib/payment/handoff";

export default function Home() {
  const paymentLinked = isPaymentLinked();
  const standardHref = getCustomerStartHref();
  const premiumHref = getCustomerPremiumStartHref();

  return (
    <HomePage
      standardHref={standardHref}
      premiumHref={premiumHref}
      paymentLinked={paymentLinked}
    />
  );
}
