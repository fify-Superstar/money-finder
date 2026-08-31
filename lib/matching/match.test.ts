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
  mapIncomeScore,
  mapTimeHours,
} from "./mapAnswers.ts";
import {
  answersForMatching,
  buildExplanation,
  buildMoneyMapInsight,
  compareMatches,
  equalityFit,
  evaluateOpportunity,
  incomeFit,
  matchAssessment,
  rankMatches,
  riskFit,
  scoreWeightsTotal,
  selectTop3,
  techFit,
  tieScore,
  timeFit,
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
const PROJECT = "I prefer project-based work with deadlines";
const SALARY_GOAL = "Replace my full-time salary";
const SIDE_GOAL = "Generate a secondary side income";

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
    riskRequirement: 4,
    skills: [WRITING],
    workingStyles: [PEOPLE],
    techRequirement: 2,
    goals: [SALARY_GOAL],
    incomePotentialMin: 500,
    incomePotentialMax: 1000,
    idealTimeHours: 1,
    milestones: ["Milestone 1", "Milestone 2", "Milestone 3"],
    actions: ["Action 1", "Action 2", "Action 3"],
    ...overrides,
  };
}

function eligibleByName(report: ReturnType<typeof matchAssessment>, name: string) {
  return report.matches.find((match) => match.opportunity.name === name);
}

test("time mapping: Under 5 hours maps to 4 in the matching layer", () => {
  assert.equal(mapTimeHours("Under 5 hours"), 4);
  assert.equal(mapAssessmentAnswers(r007Answers()).timeHours, 4);
  assert.equal(mapAssessmentAnswers(r007Answers()).timeLabel, "Under 5 hours");
});

test("budget mapping uses V9 range floors", () => {
  assert.equal(mapBudgetDollars("0 dollars"), 0);
  assert.equal(mapBudgetDollars("100 - 500 dollars"), 100);
  assert.equal(mapBudgetDollars("500 - 2000 dollars"), 500);
  assert.equal(mapBudgetDollars("2000+ dollars"), 2000);

  const mapped = mapAssessmentAnswers(r007Answers());
  assert.equal(mapped.budgetLabel, "500 - 2000 dollars");
  assert.equal(mapped.budgetDollars, 500);
});

test("desired income maps onto the V9 1-5 score", () => {
  assert.equal(mapIncomeScore("$500–$1,000"), 2);
  assert.equal(mapAssessmentAnswers(r007Answers()).desiredIncomeScore, 2);
});

test("hard budget constraint: mapped 500 is eligible at min 500 and fails min 2000", () => {
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
      minBudgetDollars: 2000,
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
    opportunity({ id: "time-ok", name: "Time OK", minTimeHours: 4, idealTimeHours: 4 }),
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

test("ineligible opportunity score is 0 and is excluded from Top 3", () => {
  const answers = r007Answers();
  const catalog = [
    opportunity({ id: "ok", name: "Eligible" }),
    opportunity({
      id: "blocked",
      name: "Blocked",
      minBudgetDollars: 9000,
      minTimeHours: 20,
      riskRequirement: 5,
    }),
  ];
  const report = matchAssessment(answers, catalog);
  const blocked = report.matches.find((match) => match.opportunity.id === "blocked");

  assert.equal(blocked?.eligible, false);
  assert.equal(blocked?.score, 0);
  assert.equal(blocked?.rank, null);
  assert.equal(weightedScore(blocked?.fits ?? report.matches[0]!.fits, false), 0);
  assert.equal(
    report.top3.some((match) => match.opportunity.id === "blocked"),
    false,
  );
});

test("full V9 fit scores 100 when every dimension is 1", () => {
  const mapped = mapAssessmentAnswers(r007Answers());
  const full = evaluateOpportunity(
    mapped,
    opportunity({ id: "full", name: "Full Fit" }),
  );

  assert.equal(full.eligible, true);
  assert.equal(full.fits.budget, 1);
  assert.equal(full.fits.time, 1);
  assert.equal(full.fits.skill, 1);
  assert.equal(full.fits.workStyle, 1);
  assert.equal(full.fits.risk, 1);
  assert.equal(full.fits.goal, 1);
  assert.equal(full.fits.income, 1);
  assert.equal(full.fits.technology, 1);
  assert.equal(full.score, 100);
});

test("weighted score totals 100 points", () => {
  assert.equal(scoreWeightsTotal(), 100);
  assert.equal(
    SCORE_WEIGHTS.budget +
      SCORE_WEIGHTS.time +
      SCORE_WEIGHTS.skill +
      SCORE_WEIGHTS.workStyle +
      SCORE_WEIGHTS.risk +
      SCORE_WEIGHTS.goal +
      SCORE_WEIGHTS.income +
      SCORE_WEIGHTS.technology,
    100,
  );
});

test("partial time fit uses the V9 Ideal Time formula", () => {
  assert.equal(timeFit(4, 2, 2), 1);
  assert.equal(timeFit(4, 2, 4), 1);
  assert.equal(timeFit(4, 2, 6), 0.5);
  assert.equal(timeFit(1, 2, 6), 0);

  const mapped = mapAssessmentAnswers(r007Answers());
  const result = evaluateOpportunity(
    mapped,
    opportunity({
      id: "partial-time",
      name: "Partial Time",
      minTimeHours: 2,
      idealTimeHours: 6,
    }),
  );

  assert.equal(result.eligible, true);
  assert.equal(result.fits.time, 0.5);
  assert.equal(result.score, 92.5);
});

test("skill mismatch is 0.2 and remains eligible", () => {
  assert.equal(equalityFit(false), 0.2);
  const mapped = mapAssessmentAnswers(r007Answers());
  const result = evaluateOpportunity(
    mapped,
    opportunity({
      id: "skill-miss",
      name: "Skill Miss",
      skills: ["Data Analysis"],
    }),
  );

  assert.equal(result.eligible, true);
  assert.equal(result.fits.skill, 0.2);
  assert.equal(result.score, 88);
});

test("work-style mismatch is 0.2", () => {
  const mapped = mapAssessmentAnswers(r007Answers());
  const result = evaluateOpportunity(
    mapped,
    opportunity({
      id: "style-miss",
      name: "Style Miss",
      workingStyles: [PROJECT],
    }),
  );

  assert.equal(result.eligible, true);
  assert.equal(result.fits.workStyle, 0.2);
  assert.equal(result.score, 92);
});

test("goal mismatch is 0.2", () => {
  const mapped = mapAssessmentAnswers(r007Answers());
  const result = evaluateOpportunity(
    mapped,
    opportunity({
      id: "goal-miss",
      name: "Goal Miss",
      goals: [SIDE_GOAL],
    }),
  );

  assert.equal(result.eligible, true);
  assert.equal(result.fits.goal, 0.2);
  assert.equal(result.score, 92);
});

test("risk partial scoring uses 1 - abs(resp - opp) / 4", () => {
  assert.equal(riskFit(4, 4), 1);
  assert.equal(riskFit(4, 1), 0.25);

  const mapped = mapAssessmentAnswers(r007Answers());
  const result = evaluateOpportunity(
    mapped,
    opportunity({
      id: "risk-partial",
      name: "Risk Partial",
      riskRequirement: 1,
    }),
  );

  assert.equal(result.eligible, true);
  assert.equal(result.fits.risk, 0.25);
  assert.equal(result.score, 92.5);
});

test("technology scoring contributes 5 points when fit is 1", () => {
  assert.equal(techFit(4, 2), 1);
  assert.equal(techFit(4, 5), 0.75);

  const mapped = mapAssessmentAnswers(r007Answers());
  const full = evaluateOpportunity(
    mapped,
    opportunity({ id: "tech-full", name: "Tech Full", techRequirement: 2 }),
  );
  const partial = evaluateOpportunity(
    mapped,
    opportunity({ id: "tech-partial", name: "Tech Partial", techRequirement: 5 }),
  );

  assert.equal(full.fits.technology, 1);
  assert.equal(partial.fits.technology, 0.75);
  assert.equal(SCORE_WEIGHTS.technology, 5);
  assert.equal(full.fits.technology * SCORE_WEIGHTS.technology, 5);
  assert.equal(partial.fits.technology * SCORE_WEIGHTS.technology, 3.75);
  assert.equal(full.score, 100);
  assert.equal(partial.score, 98.8);
});

test("income scoring contributes 20 points when fit is 1", () => {
  assert.equal(incomeFit(2, 2), 1);
  assert.equal(incomeFit(2, 3), 1);
  assert.equal(incomeFit(2, 1), 0.75);
  assert.equal(incomeFit(0, 2), 0);

  const mapped = mapAssessmentAnswers(r007Answers());
  const compatible = evaluateOpportunity(
    mapped,
    opportunity({
      id: "income-ok",
      name: "Income OK",
      incomePotentialMin: 500,
      incomePotentialMax: 1000,
    }),
  );
  const below = evaluateOpportunity(
    mapped,
    opportunity({
      id: "income-low",
      name: "Income Low",
      incomePotentialMin: 250,
      incomePotentialMax: 500,
    }),
  );

  assert.equal(compatible.fits.income, 1);
  assert.equal(below.fits.income, 0.75);
  assert.equal(compatible.score - below.score, 5);
  assert.equal(SCORE_WEIGHTS.income * 0.25, 5);
  assert.equal(below.score, 95);
});

test("ranking never places an ineligible opportunity above an eligible one", () => {
  const mapped = mapAssessmentAnswers(r007Answers());
  const eligibleLow = evaluateOpportunity(
    mapped,
    opportunity({
      id: "eligible-low",
      name: "Eligible Low",
      workingStyles: [PROJECT],
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
  assert.equal(ordered[1]?.opportunity.id, "eligible-low");
  assert.equal(ordered[1]?.rank, 1);
  assert.equal(ordered[0]?.eligible, false);
  assert.equal(ordered[0]?.rank, null);
  assert.ok(compareMatches(eligibleLow, ineligible) < 0);
});

test("equal scores rank by later catalog index first", () => {
  const mapped = mapAssessmentAnswers(r007Answers());
  const earlier = evaluateOpportunity(
    mapped,
    opportunity({ id: "earlier", name: "Earlier Row" }),
  );
  const later = evaluateOpportunity(
    mapped,
    opportunity({ id: "later", name: "Later Row" }),
  );

  assert.equal(earlier.score, later.score);
  assert.ok(tieScore(84.5, 23) > tieScore(84.5, 22));

  const ordered = rankMatches([earlier, later]);
  assert.equal(ordered[0]?.rank, 2);
  assert.equal(ordered[1]?.rank, 1);
  assert.equal(selectTop3([earlier, later])[0]?.opportunity.id, "later");
});

test("top 3 selection returns ranks 1-3 only", () => {
  const answers = r007Answers();
  const catalog = [
    opportunity({ id: "1", name: "First" }),
    opportunity({
      id: "2",
      name: "Second",
      workingStyles: [PROJECT],
    }),
    opportunity({
      id: "3",
      name: "Third",
      workingStyles: [PROJECT],
      goals: [SIDE_GOAL],
    }),
    opportunity({
      id: "4",
      name: "Fourth",
      skills: ["Design and Creative"],
      workingStyles: [PROJECT],
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
      workingStyles: [PROJECT],
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
    "Eligible match; the listed income potential is compatible with your target. Strong skill fit. Work-style fit. Time fit. Technology fit. Risk fit. Goal fit. Budget is within your stated range.",
  );
  assert.equal(
    withoutWorkStyle.explanation,
    "Eligible match; the listed income potential is compatible with your target. Strong skill fit. Time fit. Technology fit. Risk fit. Goal fit. Budget is within your stated range.",
  );
  assert.equal(noSkill.explanation.includes("Strong skill fit."), false);
  assert.equal(withoutWorkStyle.explanation.includes("Work-style fit."), false);
  assert.equal(
    buildExplanation(false, withWorkStyle.fits),
    INELIGIBLE_EXPLANATION,
  );
});

test("R007 canonical catalog regression matches V9 live-Sheets output", () => {
  assert.equal(isCanonicalCatalogLoaded(), true);
  assert.equal(OPPORTUNITIES.length, CANONICAL_OPPORTUNITY_COUNT);

  const report = matchAssessment(r007Answers());
  assert.equal(report.evaluatedCount, 25);
  assert.equal(report.eligibleCount, 5);
  assert.equal(report.ineligibleCount, 20);
  assert.equal(report.mapped.budgetDollars, 500);

  const ranked = report.matches
    .filter((match) => match.eligible)
    .sort((left, right) => (left.rank ?? 0) - (right.rank ?? 0));

  assert.deepEqual(
    ranked.map((match) => [match.rank, match.opportunity.name, match.score]),
    [
      [1, "Small Business Email Copy", 84.5],
      [2, "Resume & LinkedIn Profile Writing", 84.5],
      [3, "Content Repurposing Writer", 76.5],
      [4, "Marketplace Listing Writer", 76.5],
      [5, "Proofreading & Editing", 76.5],
    ],
  );

  assert.deepEqual(
    report.top3.map((match) => match.opportunity.name),
    [
      "Small Business Email Copy",
      "Resume & LinkedIn Profile Writing",
      "Content Repurposing Writer",
    ],
  );

  const email = eligibleByName(report, "Small Business Email Copy");
  const resume = eligibleByName(report, "Resume & LinkedIn Profile Writing");
  const content = eligibleByName(report, "Content Repurposing Writer");
  const marketplace = eligibleByName(report, "Marketplace Listing Writer");
  const proofreading = eligibleByName(report, "Proofreading & Editing");
  const dividend = eligibleByName(report, "Dividend Investing");

  assert.equal(email?.eligible, true);
  assert.equal(resume?.eligible, true);
  assert.equal(content?.eligible, true);
  assert.equal(marketplace?.eligible, true);
  assert.equal(proofreading?.eligible, true);
  assert.equal(email?.rank, 1);
  assert.equal(resume?.rank, 2);
  assert.equal(content?.rank, 3);
  assert.equal(marketplace?.rank, 4);
  assert.equal(proofreading?.rank, 5);
  assert.equal(dividend?.eligible, false);
  assert.equal(dividend?.score, 0);
  assert.equal(dividend?.rank, null);
  assert.ok((dividend?.opportunity.minBudgetDollars ?? 0) > 500);
});

test("R007 cannot qualify for Dividend Investing because budget 500 < 2000", () => {
  const dividend = OPPORTUNITIES.find(
    (row) => row.name === "Dividend Investing",
  );
  assert.ok(dividend);
  assert.equal(dividend.minBudgetDollars, 2000);

  const result = evaluateOpportunity(mapAssessmentAnswers(r007Answers()), dividend);
  assert.equal(result.eligible, false);
  assert.equal(result.score, 0);
});

test("tie-break specifically ranks Email Copy before Resume at 84.5", () => {
  const report = matchAssessment(r007Answers());
  const emailIndex = OPPORTUNITIES.findIndex(
    (row) => row.name === "Small Business Email Copy",
  );
  const resumeIndex = OPPORTUNITIES.findIndex(
    (row) => row.name === "Resume & LinkedIn Profile Writing",
  );

  assert.equal(emailIndex, 22);
  assert.equal(resumeIndex, 21);
  assert.equal(report.top3[0]?.opportunity.name, "Small Business Email Copy");
  assert.equal(report.top3[1]?.opportunity.name, "Resume & LinkedIn Profile Writing");
  assert.equal(report.top3[0]?.score, 84.5);
  assert.equal(report.top3[1]?.score, 84.5);
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
