import assert from "node:assert/strict";
import test from "node:test";
import type { AssessmentAnswers } from "../assessment/types.ts";
import {
  mapAssessmentAnswers,
  mapBudgetDollars,
  mapIncomeScore,
  mapTimeHours,
} from "./mapAnswers.ts";
import { evaluateOpportunity } from "./match.ts";
import {
  normalizeGoal,
  normalizeSkill,
  normalizeWorkingStyle,
} from "./normalizeAnswers.ts";
import type { Opportunity } from "./types.ts";

test("goal: approved mappings including R007 identity", () => {
  assert.equal(
    normalizeGoal("Replace my full-time salary"),
    "Replace my full-time salary",
  );
  assert.equal(
    normalizeGoal("Generate secondary side income"),
    "Generate a secondary side income",
  );
  assert.equal(
    normalizeGoal("Build a savings buffer/emergency fund"),
    "Build a savings buffer or emergency fund",
  );
  assert.equal(normalizeGoal("Pay down debt"), "Pay off specific debt");
});

test("goal: unmatched V10 values and unknowns pass through", () => {
  assert.equal(normalizeGoal("Build a business"), "Build a business");
  assert.equal(
    normalizeGoal("Create more financial freedom"),
    "Create more financial freedom",
  );
  assert.equal(normalizeGoal("Other"), "Other");
  assert.equal(normalizeGoal("Unknown goal"), "Unknown goal");
});

test("skill: approved mappings including R007 identity", () => {
  assert.equal(
    normalizeSkill("Writing and Content Creation"),
    "Writing and Content Creation",
  );
  assert.equal(normalizeSkill("Design and Creative"), "Design and Creative Arts");
  assert.equal(
    normalizeSkill("Administration and Organisation"),
    "Administrative and Organizational",
  );
  assert.equal(normalizeSkill("Technology and Digital"), "Technical/Coding/IT");
  assert.equal(
    normalizeSkill("Sales and Communication"),
    "Sales, Marketing, or Customer Service",
  );
  assert.equal(normalizeSkill("Teaching and Coaching"), "Teaching or Consulting");
  assert.equal(
    normalizeSkill("Practical / Hands-on Skills"),
    "Manual Labor or Physical Services",
  );
});

test("skill: Other and unknowns pass through", () => {
  assert.equal(normalizeSkill("Other"), "Other");
  assert.equal(normalizeSkill("Unknown skill"), "Unknown skill");
});

test("working style: approved mappings including R007 identity", () => {
  assert.equal(
    normalizeWorkingStyle(
      "I prefer interacting with people (in person or online)",
    ),
    "I prefer interacting with people (in person or online)",
  );
  assert.equal(
    normalizeWorkingStyle("I prefer working independently"),
    "I prefer working alone remotely",
  );
});

test("working style: mix of both and unknowns pass through", () => {
  assert.equal(
    normalizeWorkingStyle("I prefer a mix of both"),
    "I prefer a mix of both",
  );
  assert.equal(
    normalizeWorkingStyle("Unknown working style"),
    "Unknown working style",
  );
});

test("numeric mappings are unchanged", () => {
  assert.equal(mapBudgetDollars("500 - 2000 dollars"), 500);
  assert.equal(mapTimeHours("Under 5 hours"), 4);
  assert.equal(mapIncomeScore("$500–$1,000"), 2);
});

test("mapAssessmentAnswers stores canonical V9 labels without altering raw answers", () => {
  const answers: AssessmentAnswers = {
    firstName: "Casey",
    email: "casey@example.test",
    goal: "Generate secondary side income",
    time: "Under 5 hours",
    skill: "Design and Creative",
    budget: "500 - 2000 dollars",
    workingStyle: "I prefer working independently",
    techComfort: 4,
    assets: "keep-raw",
    riskTolerance: 4,
    avoidances: [],
    desiredIncome: "$500–$1,000",
  };

  const mapped = mapAssessmentAnswers(answers);

  assert.equal(answers.goal, "Generate secondary side income");
  assert.equal(answers.skill, "Design and Creative");
  assert.equal(answers.workingStyle, "I prefer working independently");
  assert.equal(mapped.goal, "Generate a secondary side income");
  assert.equal(mapped.skill, "Design and Creative Arts");
  assert.equal(mapped.workingStyle, "I prefer working alone remotely");
  assert.equal(mapped.budgetDollars, 500);
  assert.equal(mapped.timeHours, 4);
  assert.equal(mapped.desiredIncomeScore, 2);
});

test("normalized V10 labels match canonical catalog categories in the V9 engine", () => {
  const answers: AssessmentAnswers = {
    firstName: "Casey",
    email: "casey@example.test",
    goal: "Generate secondary side income",
    time: "Under 5 hours",
    skill: "Design and Creative",
    budget: "500 - 2000 dollars",
    workingStyle: "I prefer working independently",
    techComfort: 4,
    assets: "",
    riskTolerance: 4,
    avoidances: [],
    desiredIncome: "$500–$1,000",
  };

  const mapped = mapAssessmentAnswers(answers);
  const canonical: Opportunity = {
    id: "norm-1",
    name: "Canonical Fit",
    minTimeHours: 1,
    minBudgetDollars: 0,
    riskRequirement: 4,
    skills: ["Design and Creative Arts"],
    workingStyles: ["I prefer working alone remotely"],
    techRequirement: 2,
    goals: ["Generate a secondary side income"],
    incomePotentialMin: 500,
    incomePotentialMax: 1000,
    idealTimeHours: 1,
    milestones: ["M1", "M2", "M3"],
    actions: ["A1", "A2", "A3"],
  };

  const matched = evaluateOpportunity(mapped, canonical);
  const rawMismatch = evaluateOpportunity(
    {
      ...mapped,
      goal: answers.goal,
      skill: answers.skill,
      workingStyle: answers.workingStyle,
    },
    canonical,
  );

  assert.equal(matched.eligible, true);
  assert.equal(matched.fits.skill, 1);
  assert.equal(matched.fits.workStyle, 1);
  assert.equal(matched.fits.goal, 1);
  assert.equal(rawMismatch.fits.skill, 0.2);
  assert.equal(rawMismatch.fits.workStyle, 0.2);
  assert.equal(rawMismatch.fits.goal, 0.2);
});
