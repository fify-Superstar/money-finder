import type { MatchReport, OpportunityMatch } from "../matching/types.ts";
import type { MoneyMap, MoneyMapMatch, MoneyMapStep } from "./types.ts";

function asStep(label: string): MoneyMapStep {
  return { label };
}

function toMatch(match: OpportunityMatch): MoneyMapMatch | null {
  if (!match.eligible || match.rank === null) {
    return null;
  }

  const [m1, m2, m3] = match.opportunity.milestones;
  const [a1, a2, a3] = match.opportunity.actions;

  return {
    id: match.opportunity.id,
    rank: match.rank,
    name: match.opportunity.name,
    score: match.score,
    explanation: match.explanation,
    milestones: [asStep(m1), asStep(m2), asStep(m3)],
    actions: [asStep(a1), asStep(a2), asStep(a3)],
  };
}

export function moneyMapFromMatchReport(
  report: MatchReport,
  insight: string,
): MoneyMap {
  return {
    firstName: report.answers.firstName.trim() || "there",
    insight,
    matches: report.top3
      .map(toMatch)
      .filter((match): match is MoneyMapMatch => match !== null)
      .slice(0, 3),
  };
}
