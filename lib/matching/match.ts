import type { AssessmentAnswers } from "../assessment/types.ts";
import { mapAssessmentAnswers } from "./mapAnswers.ts";
import { OPPORTUNITIES } from "./catalog.ts";
import {
  INELIGIBLE_EXPLANATION,
  MISMATCH_FIT,
  SCORE_WEIGHTS,
  type DimensionFits,
  type MappedAnswers,
  type MatchReport,
  type Opportunity,
  type OpportunityMatch,
} from "./types.ts";
import {
  opportunityIdealTimeHours,
  opportunityIncomeScore,
} from "./v9Fields.ts";

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

export function timeFit(
  respTime: number,
  minTime: number,
  idealTime: number,
): number {
  if (idealTime === minTime) {
    return 1;
  }
  if (respTime >= idealTime) {
    return 1;
  }
  return Math.max(0, (respTime - minTime) / (idealTime - minTime));
}

export function equalityFit(matched: boolean): number {
  return matched ? 1 : MISMATCH_FIT;
}

export function riskFit(respRisk: number, oppRisk: number): number {
  return 1 - Math.abs(respRisk - oppRisk) / 4;
}

export function techFit(respTech: number, oppTech: number): number {
  if (respTech >= oppTech) {
    return 1;
  }
  return Math.max(0, 1 - (oppTech - respTech) / 4);
}

export function incomeFit(respIncome: number, oppIncome: number): number {
  if (respIncome <= 0) {
    return 0;
  }
  if (oppIncome >= respIncome) {
    return 1;
  }
  return Math.max(0, 1 - Math.abs(respIncome - oppIncome) / 4);
}

export function tieScore(score: number, catalogIndex: number): number {
  return score + catalogIndex / 10_000;
}

export function scoreDimensionFits(
  mapped: MappedAnswers,
  opportunity: Opportunity,
): DimensionFits {
  const eligible = passesHardConstraints(mapped, opportunity);
  const oppIncome = opportunityIncomeScore(opportunity);
  const income = incomeFit(mapped.desiredIncomeScore, oppIncome);

  return {
    budget: eligible ? 1 : 0,
    time: timeFit(
      mapped.timeHours,
      opportunity.minTimeHours,
      opportunityIdealTimeHours(opportunity),
    ),
    skill: equalityFit(opportunity.skills.includes(mapped.skill)),
    workStyle: equalityFit(
      opportunity.workingStyles.includes(mapped.workingStyle),
    ),
    goal: equalityFit(opportunity.goals.includes(mapped.goal)),
    risk: riskFit(mapped.riskTolerance, opportunity.riskRequirement),
    technology: techFit(mapped.techComfort, opportunity.techRequirement),
    income,
    incomeCompatible: oppIncome >= mapped.desiredIncomeScore,
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
      fits.goal * SCORE_WEIGHTS.goal +
      fits.income * SCORE_WEIGHTS.income +
      fits.technology * SCORE_WEIGHTS.technology,
  );
}

export function buildExplanation(
  eligible: boolean,
  fits: DimensionFits,
  details?: {
    desiredIncomeScore: number;
    opportunityIncomeScore: number;
    timeHours: number;
    minTimeHours: number;
    budgetDollars: number;
    minBudgetDollars: number;
  },
): string {
  if (!eligible) {
    return INELIGIBLE_EXPLANATION;
  }

  const incomeAboveTarget =
    details !== undefined
      ? details.desiredIncomeScore > details.opportunityIncomeScore
      : !fits.incomeCompatible;
  const timeLimiting =
    details !== undefined && details.timeHours < details.minTimeHours;
  const budgetWithin =
    details === undefined || details.budgetDollars >= details.minBudgetDollars;

  const parts = [
    incomeAboveTarget
      ? "Eligible match; your income target is above the listed opportunity potential."
      : "Eligible match; the listed income potential is compatible with your target.",
  ];

  if (fits.skill === 1) {
    parts.push("Strong skill fit.");
  }
  if (fits.workStyle === 1) {
    parts.push("Work-style fit.");
  }
  if (fits.time === 1) {
    parts.push("Time fit.");
  } else if (timeLimiting) {
    parts.push("Time is a limiting factor.");
  }
  if (fits.technology === 1) {
    parts.push("Technology fit.");
  }
  if (fits.risk === 1) {
    parts.push("Risk fit.");
  }
  if (fits.goal === 1) {
    parts.push("Goal fit.");
  }
  if (budgetWithin) {
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
    explanation: buildExplanation(eligible, fits, {
      desiredIncomeScore: mapped.desiredIncomeScore,
      opportunityIncomeScore: opportunityIncomeScore(opportunity),
      timeHours: mapped.timeHours,
      minTimeHours: opportunity.minTimeHours,
      budgetDollars: mapped.budgetDollars,
      minBudgetDollars: opportunity.minBudgetDollars,
    }),
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

  return right.score - left.score;
}

export function rankMatches(matches: OpportunityMatch[]): OpportunityMatch[] {
  const tieScores = matches.map((match, index) =>
    tieScore(match.score, index + 1),
  );

  return matches.map((match, index) => {
    if (!match.eligible) {
      return { ...match, rank: null };
    }

    const tsc = tieScores[index] ?? 0;
    const better = matches.reduce((count, other, otherIndex) => {
      if (!other.eligible) {
        return count;
      }
      const otherTie = tieScores[otherIndex] ?? 0;
      return otherTie > tsc ? count + 1 : count;
    }, 0);

    return { ...match, rank: better + 1 };
  });
}

export function selectTop3(matches: OpportunityMatch[]): OpportunityMatch[] {
  return rankMatches(matches)
    .filter(
      (match) => match.eligible && match.rank !== null && match.rank <= 3,
    )
    .sort((left, right) => (left.rank ?? 0) - (right.rank ?? 0));
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
    SCORE_WEIGHTS.goal +
    SCORE_WEIGHTS.income +
    SCORE_WEIGHTS.technology
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
