import type { Metadata } from "next";
import { CompletedAssessmentNotice } from "@/components/assessment/CompletedAssessmentNotice";
import { ActionList } from "@/components/ui/ActionList";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { MilestoneList } from "@/components/ui/MilestoneList";
import { PageHeader } from "@/components/ui/PageHeader";
import { ResultsCard } from "@/components/ui/ResultsCard";
import { ScoreDisplay } from "@/components/ui/ScoreDisplay";
import { Container } from "@/components/layout/Container";

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
        description="This is a placeholder for the Top 3 Money Map. Matching, scores, and opportunity details are not implemented yet."
      />
      <CompletedAssessmentNotice />
      <EmptyState
        title="No Money Map yet"
        description="Complete the assessment to generate your personalised Top 3. Opportunity matching has not been added in this foundation."
        action={
          <Button href="/assessment" variant="secondary">
            Go to assessment
          </Button>
        }
      />
      <ResultsCard
        rank={1}
        title="Match placeholder"
        explanation="Each result card will later show a matched opportunity, why it fits, and the first steps to take."
      >
        <ScoreDisplay label="Match score" score={null} />
      </ResultsCard>
      <MilestoneList items={[]} />
      <ActionList items={[]} />
    </Container>
  );
}
