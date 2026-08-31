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
        title="Your results"
        description="These matches are a fit against the current opportunity catalog. They are not a guarantee of income."
      />
      <ResultsWorkspace />
    </Container>
  );
}
