import type { Metadata } from "next";
import { AssessmentWorkspace } from "@/components/assessment/AssessmentWorkspace";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/ui/PageHeader";

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
        description="Twelve focused questions. A$19 is a one-time payment later — no subscription. Results are personalised matches, not a guarantee of income."
      />
      <AssessmentWorkspace />
    </Container>
  );
}
