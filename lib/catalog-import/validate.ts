import {
  CANONICAL_OPPORTUNITY_COUNT,
  type Opportunity,
} from "../matching/types.ts";

export const REQUIRED_OPPORTUNITY_FIELDS = [
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
] as const;

export type CatalogImportIssue = {
  index: number | null;
  field: (typeof REQUIRED_OPPORTUNITY_FIELDS)[number] | "length" | null;
  message: string;
};

export type CatalogImportResult = {
  ok: boolean;
  opportunityCount: number;
  expectedCount: typeof CANONICAL_OPPORTUNITY_COUNT;
  issues: CatalogImportIssue[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isTriple(value: unknown): value is [string, string, string] {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((item) => isNonEmptyString(item))
  );
}

function issue(
  index: number | null,
  field: CatalogImportIssue["field"],
  message: string,
): CatalogImportIssue {
  return { index, field, message };
}

function validateOpportunity(
  value: unknown,
  index: number,
): CatalogImportIssue[] {
  if (!isRecord(value)) {
    return [issue(index, null, "Opportunity must be an object.")];
  }

  const issues: CatalogImportIssue[] = [];

  for (const field of REQUIRED_OPPORTUNITY_FIELDS) {
    if (!(field in value)) {
      issues.push(issue(index, field, `Missing required field: ${field}.`));
    }
  }

  if (!isNonEmptyString(value.id)) {
    issues.push(issue(index, "id", "id must be a non-empty string."));
  }
  if (!isNonEmptyString(value.name)) {
    issues.push(issue(index, "name", "name must be a non-empty string."));
  }
  if (!isFiniteNumber(value.minTimeHours)) {
    issues.push(
      issue(index, "minTimeHours", "minTimeHours must be a finite number."),
    );
  }
  if (!isFiniteNumber(value.minBudgetDollars)) {
    issues.push(
      issue(
        index,
        "minBudgetDollars",
        "minBudgetDollars must be a finite number.",
      ),
    );
  }
  if (!isFiniteNumber(value.riskRequirement)) {
    issues.push(
      issue(
        index,
        "riskRequirement",
        "riskRequirement must be a finite number.",
      ),
    );
  }
  if (!isStringArray(value.skills)) {
    issues.push(issue(index, "skills", "skills must be an array of strings."));
  }
  if (!isStringArray(value.workingStyles)) {
    issues.push(
      issue(
        index,
        "workingStyles",
        "workingStyles must be an array of strings.",
      ),
    );
  }
  if (!isFiniteNumber(value.techRequirement)) {
    issues.push(
      issue(
        index,
        "techRequirement",
        "techRequirement must be a finite number.",
      ),
    );
  }
  if (!isStringArray(value.goals)) {
    issues.push(issue(index, "goals", "goals must be an array of strings."));
  }
  if (!isFiniteNumber(value.incomePotentialMin)) {
    issues.push(
      issue(
        index,
        "incomePotentialMin",
        "incomePotentialMin must be a finite number.",
      ),
    );
  }
  if (!isFiniteNumber(value.incomePotentialMax)) {
    issues.push(
      issue(
        index,
        "incomePotentialMax",
        "incomePotentialMax must be a finite number.",
      ),
    );
  }
  if (!isTriple(value.milestones)) {
    issues.push(
      issue(
        index,
        "milestones",
        "milestones must be exactly three non-empty strings.",
      ),
    );
  }
  if (!isTriple(value.actions)) {
    issues.push(
      issue(
        index,
        "actions",
        "actions must be exactly three non-empty strings.",
      ),
    );
  }

  return issues;
}

export function validateCanonicalCatalog(
  catalog: readonly unknown[],
): CatalogImportResult {
  const issues: CatalogImportIssue[] = [];

  if (catalog.length !== CANONICAL_OPPORTUNITY_COUNT) {
    issues.push(
      issue(
        null,
        "length",
        `Expected exactly ${CANONICAL_OPPORTUNITY_COUNT} opportunities, received ${catalog.length}.`,
      ),
    );
  }

  catalog.forEach((row, index) => {
    issues.push(...validateOpportunity(row, index));
  });

  return {
    ok: issues.length === 0,
    opportunityCount: catalog.length,
    expectedCount: CANONICAL_OPPORTUNITY_COUNT,
    issues,
  };
}

export function assertShapeComplete(catalog: unknown[]): catalog is Opportunity[] {
  return validateCanonicalCatalog(catalog).ok;
}
