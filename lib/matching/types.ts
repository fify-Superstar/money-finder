import type { AssessmentAnswers } from "../assessment/types.ts";

export type Opportunity = {
  id: string;
  name: string;
  minTimeHours: number;
  minBudgetDollars: number;
  riskRequirement: number;
  skills: string[];
  workingStyles: string[];
  techRequirement: number;
  goals: string[];
  incomePotentialMin: number;
  incomePotentialMax: number;
  milestones: [string, string, string];
  actions: [string, string, string];
};

export type MappedAnswers = {
  firstName: string;
  email: string;
  goal: string;
  timeLabel: string;
  timeHours: number;
  skill: string;
  budgetLabel: string;
  budgetDollars: number;
  workingStyle: string;
  techComfort: number;
  riskTolerance: number;
  desiredIncomeLabel: string;
  desiredIncomeMin: number;
  desiredIncomeMax: number;
  avoidances: string[];
  assets: string;
};

export type DimensionFits = {
  budget: number;
  time: number;
  skill: number;
  workStyle: number;
  risk: number;
  goal: number;
  technology: number;
  incomeCompatible: boolean;
};

export type OpportunityMatch = {
  opportunity: Opportunity;
  eligible: boolean;
  score: number;
  rank: number | null;
  explanation: string;
  fits: DimensionFits;
};

export type MatchReport = {
  answers: AssessmentAnswers;
  mapped: MappedAnswers;
  evaluatedCount: number;
  eligibleCount: number;
  ineligibleCount: number;
  matches: OpportunityMatch[];
  top3: OpportunityMatch[];
};

export const SCORE_WEIGHTS = {
  budget: 0.2,
  time: 0.2,
  skill: 0.2,
  workStyle: 0.15,
  risk: 0.1,
  goal: 0.15,
} as const;

export const INELIGIBLE_EXPLANATION =
  "Not eligible: one or more hard constraints are not met.";

export const CANONICAL_OPPORTUNITY_COUNT = 25;
