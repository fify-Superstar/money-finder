import assert from "node:assert/strict";
import test from "node:test";
import {
  isCanonicalCatalogLoaded,
  OPPORTUNITIES,
  SMALL_BUSINESS_EMAIL_COPY_DISPLAY,
} from "./catalog.ts";
import {
  mapAssessmentAnswers,
  mapBudgetDollars,
  mapTimeHours,
} from "./mapAnswers.ts";
import {
  answersForMatching,
  buildExplanation,
  buildMoneyMapInsight,
  compareMatches,
  evaluateOpportunity,
  matchAssessment,
  rankMatches,
  scoreWeightsTotal,
  selectTop3,
  weightedScore,
} from "./match.ts";
import {
  CANONICAL_OPPORTUNITY_COUNT,
  INELIGIBLE_EXPLANATION,
  SCORE_WEIGHTS,
  type Opportunity,
} from "./types.ts";
import type { AssessmentAnswers } from "../assessment/types.ts";
import {
  parseStoredAssessment,
  serializeAssessment,
} from "../assessment/persist.ts";
import { createInitialAssessmentState } from "../assessment/engine.ts";

const WRITING = "Writing and Content Creation";
const PEOPLE =
  "I prefer interacting with people (in person or online)";
const INDEPENDENT = "I prefer working independently";
const SALARY_GOAL = "Replace my full-time salary";
const SIDE_GOAL = "Generate secondary side income";

function r007Answers(): AssessmentAnswers {
  return {
    firstName: "Test Customer 1",
    email: "test.customer.1@example.test",
    goal: SALARY_GOAL,
    time: "Under 5 hours",
    skill: WRITING,
    budget: "500 - 2000 dollars",
    workingStyle: PEOPLE,
    techComfort: 4,
    assets: "",
    riskTolerance: 4,
    avoidances: [],
    desiredIncome: "$500–$1,000",
  };
}

function opportunity(
  overrides: Partial<Opportunity> & Pick<Opportunity, "id" | "name">,
): Opportunity {
  return {
    minTimeHours: 1,
    minBudgetDollars: 0,
    riskRequirement: 1,
    skills: [WRITING],
    workingStyles: [PEOPLE],
    techRequirement: 3,
    goals: [SALARY_GOAL],
    incomePotentialMin: 500,
    incomePotentialMax: 1000,
    milestones: ["Milestone 1", "Milestone 2", "Milestone 3"],
    actions: ["Action 1", "Action 2", "Action 3"],
    ...overrides,
  };
}

test("time mapping: Under 5 hours maps to 4 in the matching layer", () => {
  assert.equal(mapTimeHours("Under 5 hours"), 4);
  assert.equal(mapAssessmentAnswers(r007Answers()).timeHours, 4);
  assert.equal(mapAssessmentAnswers(r007Answers()).timeLabel, "Under 5 hours");
});

test("budget mapping preserves assessment strings and maps 500-2000 to 2000", () => {
  assert.equal(mapBudgetDollars("0 dollars"), 0);
  assert.equal(mapBudgetDollars("100 - 500 dollars"), 500);
  assert.equal(mapBudgetDollars("500 - 2000 dollars"), 2000);
  assert.equal(mapBudgetDollars("2000+ dollars"), 10_000);

  const mapped = mapAssessmentAnswers(r007Answers());
  assert.equal(mapped.budgetLabel, "500 - 2000 dollars");
  assert.equal(mapped.budgetDollars, 2000);
});

test("hard budget constraint: 500-2000 remains eligible for opportunities requiring <= $500", () => {
  const mapped = mapAssessmentAnswers(r007Answers());
  const within = evaluateOpportunity(
    mapped,
    opportunity({ id: "budget-ok", name: "Budget OK", minBudgetDollars: 500 }),
  );
  const over = evaluateOpportunity(
    mapped,
    opportunity({
      id: "budget-fail",
      name: "Budget Fail",
      minBudgetDollars: 2001,
    }),
  );

  assert.equal(within.eligible, true);
  assert.ok(within.score > 0);
  assert.equal(over.eligible, false);
  assert.equal(over.score, 0);
});

test("hard time constraint: mapped 4 hours fails opportunities requiring 5+", () => {
  const mapped = mapAssessmentAnswers(r007Answers());
  const within = evaluateOpportunity(
    mapped,
    opportunity({ id: "time-ok", name: "Time OK", minTimeHours: 4 }),
  );
  const over = evaluateOpportunity(
    mapped,
    opportunity({ id: "time-fail", name: "Time Fail", minTimeHours: 5 }),
  );

  assert.equal(within.eligible, true);
  assert.equal(over.eligible, false);
  assert.equal(over.score, 0);
  assert.equal(over.explanation, INELIGIBLE_EXPLANATION);
});

test("hard risk constraint: risk 4 fails opportunities requiring 5", () => {
  const mapped = mapAssessmentAnswers(r007Answers());
  const within = evaluateOpportunity(
    mapped,
    opportunity({ id: "risk-ok", name: "Risk OK", riskRequirement: 4 }),
  );
  const over = evaluateOpportunity(
    mapped,
    opportunity({ id: "risk-fail", name: "Risk Fail", riskRequirement: 5 }),
  );

  assert.equal(within.eligible, true);
  assert.equal(over.eligible, false);
  assert.equal(over.score, 0);
  assert.equal(over.explanation, INELIGIBLE_EXPLANATION);
});

test("ineligible opportunity score is 0", () => {
  const mapped = mapAssessmentAnswers(r007Answers());
  const result = evaluateOpportunity(
    mapped,
    opportunity({
      id: "blocked",
      name: "Blocked",
      minBudgetDollars: 9000,
      minTimeHours: 20,
      riskRequirement: 5,
    }),
  );

  assert.equal(result.eligible, false);
  assert.equal(result.score, 0);
  assert.equal(weightedScore(result.fits, false), 0);
});

test("eligible opportunity scoring uses the documented weights", () => {
  const mapped = mapAssessmentAnswers(r007Answers());
  const full = evaluateOpportunity(
    mapped,
    opportunity({ id: "full", name: "Full Fit" }),
  );
  const noWorkNoGoal = evaluateOpportunity(
    mapped,
    opportunity({
      id: "partial",
      name: "Partial Fit",
      workingStyles: [INDEPENDENT],
      goals: [SIDE_GOAL],
    }),
  );

  assert.equal(full.eligible, true);
  assert.equal(full.score, 100);
  assert.equal(noWorkNoGoal.eligible, true);
  assert.equal(noWorkNoGoal.score, 70);
});

test("weighted score totals 100%", () => {
  assert.equal(scoreWeightsTotal(), 1);
  assert.equal(
    SCORE_WEIGHTS.budget * 100 +
      SCORE_WEIGHTS.time * 100 +
      SCORE_WEIGHTS.skill * 100 +
      SCORE_WEIGHTS.workStyle * 100 +
      SCORE_WEIGHTS.risk * 100 +
      SCORE_WEIGHTS.goal * 100,
    100,
  );
});

test("ranking never places an ineligible opportunity above an eligible one", () => {
  const mapped = mapAssessmentAnswers(r007Answers());
  const eligibleLow = evaluateOpportunity(
    mapped,
    opportunity({
      id: "eligible-low",
      name: "Eligible Low",
      workingStyles: [INDEPENDENT],
      goals: [SIDE_GOAL],
    }),
  );
  const ineligible = evaluateOpportunity(
    mapped,
    opportunity({
      id: "ineligible",
      name: "AAA Ineligible",
      minBudgetDollars: 9000,
    }),
  );

  const ordered = rankMatches([ineligible, eligibleLow]);
  assert.equal(ordered[0]?.opportunity.id, "eligible-low");
  assert.equal(ordered[0]?.rank, 1);
  assert.equal(ordered[1]?.eligible, false);
  assert.equal(ordered[1]?.rank, null);
  assert.ok(compareMatches(eligibleLow, ineligible) < 0);
});

test("tie-breaking is deterministic by name then id", () => {
  const mapped = mapAssessmentAnswers(r007Answers());
  const zebra = evaluateOpportunity(
    mapped,
    opportunity({ id: "z", name: "Zebra Copy" }),
  );
  const alphaB = evaluateOpportunity(
    mapped,
    opportunity({ id: "b", name: "Alpha Copy" }),
  );
  const alphaA = evaluateOpportunity(
    mapped,
    opportunity({ id: "a", name: "Alpha Copy" }),
  );

  assert.equal(zebra.score, alphaB.score);
  const ordered = rankMatches([zebra, alphaB, alphaA]);
  assert.deepEqual(
    ordered.map((match) => match.opportunity.id),
    ["a", "b", "z"],
  );
  assert.deepEqual(
    ordered.map((match) => match.rank),
    [1, 2, 3],
  );
});

test("top 3 selection returns the highest eligible matches only", () => {
  const answers = r007Answers();
  const catalog = [
    opportunity({ id: "1", name: "First" }),
    opportunity({
      id: "2",
      name: "Second",
      workingStyles: [INDEPENDENT],
    }),
    opportunity({
      id: "3",
      name: "Third",
      workingStyles: [INDEPENDENT],
      goals: [SIDE_GOAL],
    }),
    opportunity({
      id: "4",
      name: "Fourth",
      skills: ["Design and Creative"],
      workingStyles: [INDEPENDENT],
      goals: [SIDE_GOAL],
    }),
    opportunity({
      id: "blocked",
      name: "Blocked",
      minTimeHours: 20,
    }),
  ];

  const report = matchAssessment(answers, catalog);
  assert.equal(report.evaluatedCount, 5);
  assert.equal(report.eligibleCount, 4);
  assert.equal(report.ineligibleCount, 1);
  assert.equal(report.top3.length, 3);
  assert.deepEqual(
    report.top3.map((match) => match.opportunity.name),
    ["First", "Second", "Third"],
  );
  assert.deepEqual(
    report.top3.map((match) => match.rank),
    [1, 2, 3],
  );
});

test("personalised explanations include only the fits that apply", () => {
  const mapped = mapAssessmentAnswers(r007Answers());
  const withWorkStyle = evaluateOpportunity(
    mapped,
    opportunity({ id: "people", name: "People Fit" }),
  );
  const withoutWorkStyle = evaluateOpportunity(
    mapped,
    opportunity({
      id: "solo",
      name: "Solo Fit",
      workingStyles: [INDEPENDENT],
    }),
  );
  const noSkill = evaluateOpportunity(
    mapped,
    opportunity({
      id: "other-skill",
      name: "Other Skill",
      skills: ["Design and Creative"],
    }),
  );

  assert.equal(
    withWorkStyle.explanation,
    "Eligible match; the listed income potential is compatible with your target. Strong skill fit. Work-style fit. Time fit. Technology fit. Budget is within your stated range.",
  );
  assert.equal(
    withoutWorkStyle.explanation,
    "Eligible match; the listed income potential is compatible with your target. Strong skill fit. Time fit. Technology fit. Budget is within your stated range.",
  );
  assert.equal(noSkill.explanation.includes("Strong skill fit."), false);
  assert.equal(withoutWorkStyle.explanation.includes("Work-style fit."), false);
  assert.equal(
    buildExplanation(false, withWorkStyle.fits),
    INELIGIBLE_EXPLANATION,
  );
});

test("R007 regression cannot run until the canonical 25-opportunity catalog is supplied", () => {
  assert.equal(OPPORTUNITIES.length, 0);
  assert.equal(isCanonicalCatalogLoaded(), false);
  assert.equal(CANONICAL_OPPORTUNITY_COUNT, 25);

  const report = matchAssessment(r007Answers());
  assert.equal(report.evaluatedCount, 0);
  assert.equal(report.eligibleCount, 0);
  assert.notEqual(report.evaluatedCount, 25);
});

test("known Small Business Email Copy milestones and actions are preserved for Rank 1 wiring", () => {
  const mapped = mapAssessmentAnswers(r007Answers());
  const result = evaluateOpportunity(
    mapped,
    opportunity({
      id: "email-copy-display-only",
      name: SMALL_BUSINESS_EMAIL_COPY_DISPLAY.name,
      milestones: [...SMALL_BUSINESS_EMAIL_COPY_DISPLAY.milestones],
      actions: [...SMALL_BUSINESS_EMAIL_COPY_DISPLAY.actions],
    }),
  );

  assert.deepEqual(result.opportunity.milestones, [
    "Write 3 sample emails",
    "Offer a starter package",
    "Land first client",
  ]);
  assert.deepEqual(result.opportunity.actions, [
    "Learn basic email copy",
    "Build a sample pack",
    "Contact local businesses",
  ]);
});

test("results matching only reads answers from a completed stored assessment", () => {
  const answers = r007Answers();
  const complete = {
    ...createInitialAssessmentState(),
    step: "complete" as const,
    answers,
    submittedAt: "2026-08-31T00:00:00.000Z",
  };
  const review = { ...complete, step: "review" as const };

  assert.equal(answersForMatching(null), null);
  assert.equal(answersForMatching(review), null);
  assert.deepEqual(answersForMatching(complete), answers);

  const restored = parseStoredAssessment(serializeAssessment(complete));
  assert.equal(restored?.step, "complete");
  assert.deepEqual(answersForMatching(restored), answers);

  const insight = buildMoneyMapInsight(
    answers.firstName,
    evaluateOpportunity(
      mapAssessmentAnswers(answers),
      opportunity({ id: "insight", name: "Full Fit" }),
    ),
  );
  assert.match(insight, /Test Customer 1/);
  assert.match(insight, /Full Fit/);
});
