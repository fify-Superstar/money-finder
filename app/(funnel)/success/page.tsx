import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/layout/Container";
import {
  ACCESS_COOKIE_NAME,
  readAccessSigningSecret,
  verifyAccessToken,
} from "@/lib/payment/accessCookie";
import {
  POST_PAYMENT_CONTINUE_PATH,
  isPaymentLinked,
} from "@/lib/payment/handoff";

export const metadata: Metadata = {
  title: "Payment — Money Finder",
  description: "Confirm your Money Finder payment and continue to the assessment.",
};

type SuccessSearchParams = Promise<{
  session_id?: string | string[];
  error?: string | string[];
}>;

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: SuccessSearchParams;
}) {
  const params = await searchParams;
  const sessionId = firstParam(params.session_id);
  const error = firstParam(params.error);
  const paymentLinked = isPaymentLinked();
  const cookieStore = await cookies();
  const access = await verifyAccessToken(
    cookieStore.get(ACCESS_COOKIE_NAME)?.value,
    readAccessSigningSecret(),
  );

  if (paymentLinked && sessionId && !access && error !== "unconfirmed") {
    redirect(
      `/api/stripe/complete?session_id=${encodeURIComponent(sessionId)}`,
    );
  }

  if (!paymentLinked) {
    return (
      <Container className="py-12 sm:py-16">
        <PageHeader
          eyebrow="Money Finder"
          title="Payment is not connected"
          description="This page is not a receipt and does not mean anything has been charged."
        />
        <Card className="max-w-xl space-y-5">
          <p className="leading-relaxed text-muted">
            Money Finder is running as an unpaid private demo. Checkout is not
            live, so arriving here does not confirm a purchase. You can continue
            to the assessment, or go back to the home page.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href={POST_PAYMENT_CONTINUE_PATH}>
              Continue to the assessment
            </Button>
            <Button href="/" variant="secondary">
              Back to home
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  if (access) {
    return (
      <Container className="py-12 sm:py-16">
        <PageHeader
          eyebrow="Money Finder"
          title="Payment confirmed"
          description="Your Money Map is ready. Continue to your assessment."
        />
        <Card className="max-w-xl space-y-5">
          <p className="leading-relaxed text-muted">
            Stripe has confirmed this payment. You can start the assessment in
            this browser. Your Money Map is saved on this device after you
            finish — it is not emailed yet.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href={POST_PAYMENT_CONTINUE_PATH}>
              Continue to assessment
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Money Finder"
        title="Payment could not be confirmed"
        description="We could not verify a paid Stripe checkout for this visit."
      />
      <Card className="max-w-xl space-y-5">
        <p className="leading-relaxed text-muted">
          Nothing on this page is treated as proof of payment until Stripe
          confirms a completed, paid checkout session. You have not been given
          assessment access.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/" variant="secondary">
            Back to home
          </Button>
        </div>
      </Card>
    </Container>
  );
}
