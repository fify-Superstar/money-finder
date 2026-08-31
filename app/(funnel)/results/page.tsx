import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/layout/Container";
import { ResultsWorkspace } from "@/components/results/ResultsWorkspace";

export const metadata: Metadata = {
  title: "Your Money Map — Money Finder",
  description:
    "Your personalised Top 3 Money Map will appear here after the assessment is complete.",
};

export default function ResultsPage() {
  return (
    <Container className="space-y-8 py-12 sm:py-16">
      <PageHeader
        eyebrow="Personalised Money Map"
        title="Your Money Map"
        description="Your Top 3, why each one fits, and the first moves to make. Matches are not a guarantee of income."
      />
      <ResultsWorkspace />
    </Container>
  );
}
