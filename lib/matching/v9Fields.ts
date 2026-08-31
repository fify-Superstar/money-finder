import type { Opportunity } from "./types.ts";

/**
 * V9 Opportunity DB "Ideal Time Required (hours/week)" for canonical row IDs.
 * Kept here so `catalog.ts` is not modified.
 */
export const CANONICAL_IDEAL_TIME_HOURS: Readonly<Record<string, number>> = {
  "V9-01": 15,
  "V9-02": 20,
  "V9-03": 20,
  "V9-04": 5,
  "V9-05": 20,
  "V9-06": 20,
  "V9-07": 15,
  "V9-08": 15,
  "V9-09": 20,
  "V9-10": 15,
  "V9-11": 20,
  "V9-12": 15,
  "V9-13": 10,
  "V9-14": 10,
  "V9-15": 15,
  "V9-16": 30,
  "V9-17": 15,
  "V9-18": 20,
  "V9-19": 20,
  "V9-20": 20,
  "V9-21": 4,
  "V9-22": 4,
  "V9-23": 4,
  "V9-24": 4,
  "V9-25": 4,
};

const INCOME_BAND_SCORES: Readonly<Record<string, number>> = {
  "250:500": 1,
  "500:1000": 2,
  "1000:2500": 3,
  "2500:5000": 4,
  "5000:5000": 5,
};

export function opportunityIdealTimeHours(opportunity: Opportunity): number {
  if (
    typeof opportunity.idealTimeHours === "number" &&
    Number.isFinite(opportunity.idealTimeHours)
  ) {
    return opportunity.idealTimeHours;
  }

  const canonical = CANONICAL_IDEAL_TIME_HOURS[opportunity.id];
  if (canonical !== undefined) {
    return canonical;
  }

  return opportunity.minTimeHours;
}

export function opportunityIncomeScore(opportunity: Opportunity): number {
  const key = `${opportunity.incomePotentialMin}:${opportunity.incomePotentialMax}`;
  return INCOME_BAND_SCORES[key] ?? 0;
}
