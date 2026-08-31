"use client";

import { useEffect, useState } from "react";
import { ActionList } from "@/components/ui/ActionList";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { MilestoneList } from "@/components/ui/MilestoneList";
import { ResultsCard } from "@/components/ui/ResultsCard";
import { ScoreDisplay } from "@/components/ui/ScoreDisplay";
import { readStoredAssessment } from "@/lib/assessment/persist";
import { isCanonicalCatalogLoaded } from "@/lib/matching/catalog";
import {
  answersForMatching,
  buildMoneyMapInsight,
  matchAssessment,
} from "@/lib/matching/match";
import type { MatchReport } from "@/lib/matching/types";

type ResultsView =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "catalog-missing"; firstName: string }
  | { status: "ready"; report: MatchReport; insight: string };

export function ResultsWorkspace() {
  const [view, setView] = useState<ResultsView>({ status: "loading" });

  useEffect(() => {
    const stored = readStoredAssessment();
    const answers = answersForMatching(stored);

    if (!answers) {
      setView({ status: "missing" });
      return;
    }

    if (!isCanonicalCatalogLoaded()) {
      setView({
        status: "catalog-missing",
        firstName: answers.firstName.trim() || "there",
      });
      return;
    }

    const report = matchAssessment(answers);
    const rank1 = report.top3[0];
    setView({
      status: "ready",
      report,
      insight: rank1
        ? buildMoneyMapInsight(answers.firstName, rank1)
        : `${answers.firstName.trim() || "There"}, none of the listed opportunities currently meet your hard constraints for budget, time, and risk.`,
    });
  }, []);

  if (view.status === "loading") {
    return <LoadingState label="Loading your Money Map" />;
  }

  if (view.status === "missing") {
    return (
      <EmptyState
        title="No completed assessment yet"
        description="Finish the assessment to generate your personalised Top 3 Money Map. This page does not keep an in-progress questionnaire open."
        action={
          <Button href="/assessment" variant="secondary">
            Go to assessment
          </Button>
        }
      />
    );
  }

  if (view.status === "catalog-missing") {
    return (
      <EmptyState
        title={`Thanks, ${view.firstName}`}
        description="Your completed assessment is saved on this device. The matching engine is in place, but the canonical 25-opportunity catalog has not been loaded yet, so a Top 3 Money Map cannot be generated."
        action={
          <Button href="/assessment" variant="secondary">
            Review assessment
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <EmptyState
        title="Your Money Map insight"
        description={view.insight}
      />
      {view.report.top3.length === 0 ? (
        <EmptyState
          title="No eligible opportunities"
          description="Every opportunity failed a hard constraint for budget, time, or risk. This is not a guarantee of income — it is a fit against the current catalog."
        />
      ) : (
        view.report.top3.map((match) => (
          <ResultsCard
            key={match.opportunity.id}
            rank={match.rank ?? undefined}
            title={match.opportunity.name}
            explanation={match.explanation}
          >
            <ScoreDisplay label="Match score" score={match.score} />
            <MilestoneList
              heading="Milestones"
              headingId={`${match.opportunity.id}-milestones`}
              items={match.opportunity.milestones.map((title, index) => ({
                id: `${match.opportunity.id}-milestone-${index + 1}`,
                title,
              }))}
            />
            <ActionList
              heading="First actions"
              headingId={`${match.opportunity.id}-actions`}
              items={match.opportunity.actions.map((title, index) => ({
                id: `${match.opportunity.id}-action-${index + 1}`,
                title,
              }))}
            />
          </ResultsCard>
        ))
      )}
    </div>
  );
}
