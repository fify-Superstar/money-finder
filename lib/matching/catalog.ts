import type { Opportunity } from "./types.ts";
import { CANONICAL_OPPORTUNITY_COUNT } from "./types.ts";

/**
 * Canonical V9 opportunity rows are not in this workspace.
 * Do not invent the 25-row database. Keep this array empty until the
 * validated catalog is supplied with every required field per opportunity:
 * id, name, minTimeHours, minBudgetDollars, riskRequirement, skills,
 * workingStyles, techRequirement, goals, incomePotentialMin,
 * incomePotentialMax, milestones[3], actions[3].
 *
 * Known display strings from the R007 trace (not a complete row):
 * Small Business Email Copy / Resume & LinkedIn Profile Writing /
 * Content Repurposing Writer. Email Copy milestones/actions are known;
 * constraint and scoring fields for all 25 rows are not.
 */
export const OPPORTUNITIES: Opportunity[] = [];

export const SMALL_BUSINESS_EMAIL_COPY_DISPLAY = {
  name: "Small Business Email Copy",
  milestones: [
    "Write 3 sample emails",
    "Offer a starter package",
    "Land first client",
  ],
  actions: [
    "Learn basic email copy",
    "Build a sample pack",
    "Contact local businesses",
  ],
} as const;

export function isCanonicalCatalogLoaded(): boolean {
  return OPPORTUNITIES.length === CANONICAL_OPPORTUNITY_COUNT;
}
