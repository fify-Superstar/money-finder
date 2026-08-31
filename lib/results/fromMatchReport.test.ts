import assert from "node:assert/strict";
import test from "node:test";
import type { AssessmentAnswers } from "../assessment/types.ts";
import type { MatchReport, Opportunity, OpportunityMatch } from "../matching/types.ts";
import { moneyMapFromMatchReport } from "./fromMatchReport.ts";

const answers: AssessmentAnswers = {
  firstName: "Ada",
  email: "ada@example.test",
  goal: "Replace my full-time salary",
  time: "Under 5 hours",
  skill: "Writing and Content Creation",
  budget: "500 - 2000 dollars",
  workingStyle: "I prefer interacting with people (in person or online)",
  techComfort: 4,
  assets: "",
  riskTolerance: 4,
  avoidances: [],
  desiredIncome: "$500–$1,000",
};

function opportunity(id: string, name: string): Opportunity {
  return {
    id,
    name,
    minTimeHours: 1,
    minBudgetDollars: 0,
    riskRequirement: 1,
    skills: [answers.skill],
    workingStyles: [answers.workingStyle],
    techRequirement: 1,
    goals: [answers.goal],
    incomePotentialMin: 500,
    incomePotentialMax: 1000,
    milestones: ["Write samples", "Offer a package", "Land a client"],
    actions: ["Learn the craft", "Build a pack", "Contact buyers"],
  };
}

function eligible(
  id: string,
  name: string,
  rank: number,
  score: number,
): OpportunityMatch {
  return {
    opportunity: opportunity(id, name),
    eligible: true,
    score,
    rank,
    explanation: "Eligible match; Time fit. Budget is within your stated range.",
    fits: {
      budget: 1,
      time: 1,
      skill: 1,
      workStyle: 1,
      risk: 1,
      goal: 1,
      technology: 1,
      income: 1,
      incomeCompatible: true,
    },
  };
}

test("moneyMapFromMatchReport maps Top 3 fields for the results UI", () => {
  const first = eligible("a", "Email Copy", 1, 84.5);
  const report: MatchReport = {
    answers,
    mapped: {
      firstName: answers.firstName,
      email: answers.email,
      goal: answers.goal,
      timeLabel: answers.time,
      timeHours: 4,
      skill: answers.skill,
      budgetLabel: answers.budget,
      budgetDollars: 500,
      desiredIncomeScore: 2,
      workingStyle: answers.workingStyle,
      techComfort: 4,
      riskTolerance: 4,
      desiredIncomeLabel: answers.desiredIncome,
      desiredIncomeMin: 500,
      desiredIncomeMax: 1000,
      avoidances: [],
      assets: "",
    },
    evaluatedCount: 3,
    eligibleCount: 2,
    ineligibleCount: 1,
    matches: [],
    top3: [
      first,
      eligible("b", "Resume Writing", 2, 84.5),
      eligible("c", "Repurposing", 3, 76.5),
    ],
  };

  const map = moneyMapFromMatchReport(report, "Ada, start with Email Copy.");

  assert.equal(map.firstName, "Ada");
  assert.equal(map.insight, "Ada, start with Email Copy.");
  assert.equal(map.matches.length, 3);
  assert.equal(map.matches[0]?.rank, 1);
  assert.equal(map.matches[0]?.name, "Email Copy");
  assert.equal(map.matches[0]?.score, 84.5);
  assert.match(map.matches[0]?.explanation ?? "", /Eligible match/);
  assert.equal(map.matches[0]?.milestones[0]?.label, "Write samples");
  assert.equal(map.matches[0]?.actions[2]?.label, "Contact buyers");
});
