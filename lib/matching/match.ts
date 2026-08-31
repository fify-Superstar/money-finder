import type { AssessmentAnswers } from "../assessment/types.ts";
import { mapAssessmentAnswers } from "./mapAnswers.ts";
import { OPPORTUNITIES } from "./catalog.ts";
import {
  INELIGIBLE_EXPLANATION,
  SCORE_WEIGHTS,
  type DimensionFits,
  type MappedAnswers,
  type MatchReport,
  type Opportunity,
  type OpportunityMatch,
} from "./types.ts";

function roundScore(value: number): number {
  return Math.round(value * 10) / 10;
}

export function passesHardConstraints(
  mapped: MappedAnswers,
  opportunity: Opportunity,
): boolean {
  return (
    mapped.budgetDollars >= opportunity.minBudgetDollars &&
    mapped.timeHours >= opportunity.minTimeHours &&
    mapped.riskTolerance >= opportunity.riskRequirement
  );
}

export function scoreDimensionFits(
  mapped: MappedAnswers,
  opportunity: Opportunity,
): DimensionFits {
  const eligible = passesHardConstraints(mapped, opportunity);
  const strongSkill = opportunity.skills.includes(mapped.skill);
  const workStyleFit = opportunity.workingStyles.includes(mapped.workingStyle);
  const goalFit = opportunity.goals.includes(mapped.goal);
  const technologyFit = mapped.techComfort >= opportunity.techRequirement;
  const incomeCompatible =
    mapped.desiredIncomeMax >= opportunity.incomePotentialMin &&
    mapped.desiredIncomeMin <= opportunity.incomePotentialMax;

  return {
    budget: eligible ? 100 : 0,
    time: eligible ? 100 : 0,
    risk: eligible ? 100 : 0,
    skill: strongSkill ? 100 : 0,
    workStyle: workStyleFit ? 100 : 0,
    goal: goalFit ? 100 : 0,
    technology: technologyFit ? 100 : 0,
    incomeCompatible,
  };
}

export function weightedScore(fits: DimensionFits, eligible: boolean): number {
  if (!eligible) {
    return 0;
  }

  return roundScore(
    fits.budget * SCORE_WEIGHTS.budget +
      fits.time * SCORE_WEIGHTS.time +
      fits.skill * SCORE_WEIGHTS.skill +
      fits.workStyle * SCORE_WEIGHTS.workStyle +
      fits.risk * SCORE_WEIGHTS.risk +
      fits.goal * SCORE_WEIGHTS.goal,
  );
}

export function buildExplanation(
  eligible: boolean,
  fits: DimensionFits,
): string {
  if (!eligible) {
    return INELIGIBLE_EXPLANATION;
  }

  const parts = ["Eligible match;"];

  if (fits.incomeCompatible) {
    parts.push("the listed income potential is compatible with your target.");
  }
  if (fits.skill === 100) {
    parts.push("Strong skill fit.");
  }
  if (fits.workStyle === 100) {
    parts.push("Work-style fit.");
  }
  if (fits.time === 100) {
    parts.push("Time fit.");
  }
  if (fits.technology === 100) {
    parts.push("Technology fit.");
  }
  if (fits.budget === 100) {
    parts.push("Budget is within your stated range.");
  }

  return parts.join(" ");
}

export function evaluateOpportunity(
  mapped: MappedAnswers,
  opportunity: Opportunity,
): OpportunityMatch {
  const eligible = passesHardConstraints(mapped, opportunity);
  const fits = scoreDimensionFits(mapped, opportunity);

  return {
    opportunity,
    eligible,
    score: weightedScore(fits, eligible),
    rank: null,
    explanation: buildExplanation(eligible, fits),
    fits,
  };
}

export function compareMatches(
  left: OpportunityMatch,
  right: OpportunityMatch,
): number {
  if (left.eligible !== right.eligible) {
    return left.eligible ? -1 : 1;
  }

  if (right.score !== left.score) {
    return right.score - left.score;
  }

  const byName = left.opportunity.name.localeCompare(right.opportunity.name);
  if (byName !== 0) {
    return byName;
  }

  return left.opportunity.id.localeCompare(right.opportunity.id);
}

export function rankMatches(matches: OpportunityMatch[]): OpportunityMatch[] {
  const ordered = [...matches].sort(compareMatches);

  let eligibleRank = 0;
  return ordered.map((match) => {
    if (!match.eligible) {
      return { ...match, rank: null };
    }

    eligibleRank += 1;
    return { ...match, rank: eligibleRank };
  });
}

export function selectTop3(matches: OpportunityMatch[]): OpportunityMatch[] {
  return rankMatches(matches)
    .filter((match) => match.eligible)
    .slice(0, 3);
}

export function matchOpportunities(
  mapped: MappedAnswers,
  catalog: readonly Opportunity[],
): OpportunityMatch[] {
  return rankMatches(
    catalog.map((opportunity) => evaluateOpportunity(mapped, opportunity)),
  );
}

export function matchAssessment(
  answers: AssessmentAnswers,
  catalog: readonly Opportunity[] = OPPORTUNITIES,
): MatchReport {
  const mapped = mapAssessmentAnswers(answers);
  const matches = matchOpportunities(mapped, catalog);
  const eligibleCount = matches.filter((match) => match.eligible).length;

  return {
    answers,
    mapped,
    evaluatedCount: matches.length,
    eligibleCount,
    ineligibleCount: matches.length - eligibleCount,
    matches,
    top3: selectTop3(matches),
  };
}

export function scoreWeightsTotal(): number {
  return (
    SCORE_WEIGHTS.budget +
    SCORE_WEIGHTS.time +
    SCORE_WEIGHTS.skill +
    SCORE_WEIGHTS.workStyle +
    SCORE_WEIGHTS.risk +
    SCORE_WEIGHTS.goal
  );
}

export function answersForMatching(
  state: { step: string; answers: AssessmentAnswers } | null,
): AssessmentAnswers | null {
  if (!state || state.step !== "complete") {
    return null;
  }

  return state.answers;
}

export function buildMoneyMapInsight(
  firstName: string,
  rank1: OpportunityMatch,
): string {
  const name = firstName.trim() || "there";
  return `${name}, your strongest match is ${rank1.opportunity.name} with a fit score of ${rank1.score}. ${rank1.explanation}`;
}
