import type { Metadata } from "next";
import { AssessmentWorkspace } from "@/components/assessment/AssessmentWorkspace";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { isPaymentLinked } from "@/lib/payment/handoff";

export const metadata: Metadata = {
  title: "Assessment — Money Finder",
  description:
    "Answer 12 questions to receive a personalised Top 3 Money Map. Results are matches, not guaranteed income.",
};

export default function AssessmentPage() {
  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Money Finder"
        title="Your Money Map starts here"
        description={
          isPaymentLinked()
            ? "Twelve focused questions. Results are personalised matches, not a guarantee of income."
            : "Twelve focused questions. This is an unpaid private demo. Results are personalised matches, not a guarantee of income."
        }
      />
      <AssessmentWorkspace />
    </Container>
  );
}
