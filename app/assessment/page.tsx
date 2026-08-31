import type { Metadata } from "next";
import { AssessmentWorkspace } from "@/components/assessment/AssessmentWorkspace";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Assessment — Money Finder",
  description:
    "The Money Finder assessment will collect your answers and produce a personalised Top 3 Money Map.",
};

export default function AssessmentPage() {
  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Money Finder"
        title="Assessment"
        description="Answer 12 questions to receive a personalised Top 3 Money Map. The questions themselves will be added from the validated specification — they are not included yet."
      />
      <AssessmentWorkspace />
    </Container>
  );
}
