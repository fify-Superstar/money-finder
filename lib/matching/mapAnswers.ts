import type { AssessmentAnswers } from "../assessment/types.ts";
import type { MappedAnswers } from "./types.ts";

export const TIME_UNDER_5_HOURS = "Under 5 hours";

const TIME_HOURS: Record<string, number> = {
  [TIME_UNDER_5_HOURS]: 4,
  "5 to 10 hours": 10,
  "5–10 hours": 10,
  "10 to 20 hours": 20,
  "10–20 hours": 20,
  "More than 20 hours": 40,
  "20+ hours": 40,
};

const BUDGET_DOLLARS: Record<string, number> = {
  "0 dollars": 0,
  "$0 — I need free/low-cost options": 0,
  "100 - 500 dollars": 100,
  "500 - 2000 dollars": 500,
  "2000+ dollars": 2000,
  "Over 2000 dollars": 2000,
};

const INCOME_BANDS: Record<string, { min: number; max: number; score: number }> =
  {
    "$250–$500": { min: 250, max: 500, score: 1 },
    "Under $500": { min: 0, max: 499, score: 1 },
    "$500–$1,000": { min: 500, max: 1000, score: 2 },
    "$1,000–$2,500": { min: 1000, max: 2500, score: 3 },
    "$1,000–$2,000": { min: 1000, max: 2000, score: 3 },
    "$2,500–$5,000": { min: 2500, max: 5000, score: 4 },
    "$2,000–$5,000": { min: 2000, max: 5000, score: 4 },
    "$5,000+": { min: 5000, max: 5000, score: 5 },
  };

export function mapTimeHours(timeLabel: string): number {
  const hours = TIME_HOURS[timeLabel];
  if (hours === undefined) {
    throw new Error(`Unknown time answer: ${timeLabel}`);
  }
  return hours;
}

export function mapBudgetDollars(budgetLabel: string): number {
  const amount = BUDGET_DOLLARS[budgetLabel];
  if (amount === undefined) {
    throw new Error(`Unknown budget answer: ${budgetLabel}`);
  }
  return amount;
}

export function mapDesiredIncome(label: string): {
  min: number;
  max: number;
  score: number;
} {
  if (!label) {
    return { min: 0, max: 0, score: 0 };
  }

  const band = INCOME_BANDS[label];
  if (!band) {
    throw new Error(`Unknown desired-income answer: ${label}`);
  }
  return band;
}

export function mapIncomeScore(label: string): number {
  return mapDesiredIncome(label).score;
}

export function mapAssessmentAnswers(answers: AssessmentAnswers): MappedAnswers {
  const income = mapDesiredIncome(answers.desiredIncome);

  return {
    firstName: answers.firstName,
    email: answers.email,
    goal: answers.goal,
    timeLabel: answers.time,
    timeHours: mapTimeHours(answers.time),
    skill: answers.skill,
    budgetLabel: answers.budget,
    budgetDollars: mapBudgetDollars(answers.budget),
    workingStyle: answers.workingStyle,
    techComfort: answers.techComfort ?? 0,
    riskTolerance: answers.riskTolerance ?? 0,
    desiredIncomeLabel: answers.desiredIncome,
    desiredIncomeMin: income.min,
    desiredIncomeMax: income.max,
    desiredIncomeScore: income.score,
    avoidances: answers.avoidances,
    assets: answers.assets,
  };
}
