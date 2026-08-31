import assert from "node:assert/strict";
import test from "node:test";
import { OPPORTUNITIES } from "../matching/catalog.ts";
import { CANONICAL_OPPORTUNITY_COUNT } from "../matching/types.ts";
import {
  REQUIRED_OPPORTUNITY_FIELDS,
  validateCanonicalCatalog,
} from "./validate.ts";

const TODO = "TODO — CANONICAL V9 VALUE REQUIRED";

/**
 * Shape-only rows for importer tests. Not V9 opportunity data.
 * Must never be copied into `OPPORTUNITIES`.
 * Finite zeros only prove a number is present — they are not canonical constraints.
 */
function shapeRow(index: number, numbers: "finite" | "nan"): Record<string, unknown> {
  const isEmailCopy = index === 0;

  return {
    id: `shape-check-${index + 1}`,
    name: isEmailCopy ? "Small Business Email Copy" : TODO,
    minTimeHours: numbers === "finite" ? 0 : Number.NaN,
    minBudgetDollars: numbers === "finite" ? 0 : Number.NaN,
    riskRequirement: numbers === "finite" ? 0 : Number.NaN,
    skills: [TODO],
    workingStyles: [TODO],
    techRequirement: numbers === "finite" ? 0 : Number.NaN,
    goals: [TODO],
    incomePotentialMin: numbers === "finite" ? 0 : Number.NaN,
    incomePotentialMax: numbers === "finite" ? 0 : Number.NaN,
    milestones: isEmailCopy
      ? [
          "Write 3 sample emails",
          "Offer a starter package",
          "Land first client",
        ]
      : [TODO, TODO, TODO],
    actions: isEmailCopy
      ? [
          "Learn basic email copy",
          "Build a sample pack",
          "Contact local businesses",
        ]
      : [TODO, TODO, TODO],
  };
}

test("production catalog stays empty and is not treated as the 25-row V9 database", () => {
  assert.equal(OPPORTUNITIES.length, 0);
  assert.notEqual(OPPORTUNITIES.length, CANONICAL_OPPORTUNITY_COUNT);

  const result = validateCanonicalCatalog(OPPORTUNITIES);
  assert.equal(result.ok, false);
  assert.equal(result.expectedCount, 25);
  assert.equal(result.opportunityCount, 0);
  assert.match(result.issues[0]?.message ?? "", /Expected exactly 25/);
});

test("a supplied catalog must contain exactly 25 opportunities", () => {
  const twentyFour = Array.from({ length: 24 }, (_, index) =>
    shapeRow(index, "finite"),
  );
  const result = validateCanonicalCatalog(twentyFour);

  assert.equal(result.ok, false);
  assert.equal(result.opportunityCount, 24);
  assert.equal(result.expectedCount, 25);
});

test("every required field must be present on each opportunity", () => {
  assert.deepEqual(REQUIRED_OPPORTUNITY_FIELDS, [
    "id",
    "name",
    "minTimeHours",
    "minBudgetDollars",
    "riskRequirement",
    "skills",
    "workingStyles",
    "techRequirement",
    "goals",
    "incomePotentialMin",
    "incomePotentialMax",
    "milestones",
    "actions",
  ]);

  const rows = Array.from({ length: 25 }, (_, index) =>
    shapeRow(index, "finite"),
  );
  const { minTimeHours: _dropped, ...incomplete } = rows[0] ?? {};
  rows[0] = incomplete;

  const result = validateCanonicalCatalog(rows);
  assert.equal(result.ok, false);
  assert.equal(
    result.issues.some(
      (item) => item.field === "minTimeHours" && item.index === 0,
    ),
    true,
  );
});

test("NaN numeric fields are rejected as missing canonical numbers", () => {
  const rows = Array.from({ length: 25 }, (_, index) => shapeRow(index, "nan"));
  const result = validateCanonicalCatalog(rows);

  assert.equal(result.ok, false);
  assert.equal(
    result.issues.some((item) => item.field === "minTimeHours"),
    true,
  );
});

test("a supplied 25-row catalog with every required field present passes import validation", () => {
  const rows = Array.from({ length: 25 }, (_, index) =>
    shapeRow(index, "finite"),
  );
  const result = validateCanonicalCatalog(rows);

  assert.equal(result.opportunityCount, 25);
  assert.equal(result.ok, true);
  assert.equal(rows[0]?.name, "Small Business Email Copy");
  assert.deepEqual(rows[0]?.milestones, [
    "Write 3 sample emails",
    "Offer a starter package",
    "Land first client",
  ]);
  assert.deepEqual(rows[0]?.actions, [
    "Learn basic email copy",
    "Build a sample pack",
    "Contact local businesses",
  ]);
  assert.equal(OPPORTUNITIES.length, 0);
});
