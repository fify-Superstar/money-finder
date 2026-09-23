import type { MoneyMapMatch } from "./types.ts";

export const INCOME_MILESTONE_MONTHS = 12;

export type IncomeMilestonePoint = {
  month: string;
  monthIndex: number;
  rank1: number;
  rank2: number;
  rank3: number;
  combined: number;
};

export type IncomeMilestoneSeries = {
  key: "rank1" | "rank2" | "rank3";
  rank: number;
  name: string;
  color: string;
};

export const INCOME_SERIES_COLORS = {
  rank1: "#1d5a3e",
  rank2: "#12c98d",
  rank3: "#c45c26",
} as const;

function listedMonthly(match: MoneyMapMatch): number {
  const mid = (match.incomePotentialMin + match.incomePotentialMax) / 2;
  const fit = Math.min(Math.max(match.score / 100, 0), 1);
  return Math.max(0, mid * fit);
}

function rampFactor(monthIndex: number): number {
  const t = monthIndex / INCOME_MILESTONE_MONTHS;
  return 1 - (1 - t) * (1 - t);
}

export function buildIncomeMilestonePoints(
  matches: MoneyMapMatch[],
): IncomeMilestonePoint[] {
  const ranked = [1, 2, 3].map((rank) =>
    matches.find((match) => match.rank === rank),
  );
  const monthly = ranked.map((match) => (match ? listedMonthly(match) : 0));

  return Array.from({ length: INCOME_MILESTONE_MONTHS }, (_, index) => {
    const monthIndex = index + 1;
    const factor = rampFactor(monthIndex);
    const rank1 = Math.round(monthly[0] * factor);
    const rank2 = Math.round(monthly[1] * factor);
    const rank3 = Math.round(monthly[2] * factor);
    return {
      month: `M${monthIndex}`,
      monthIndex,
      rank1,
      rank2,
      rank3,
      combined: rank1 + rank2 + rank3,
    };
  });
}

export function buildIncomeMilestoneSeries(
  matches: MoneyMapMatch[],
): IncomeMilestoneSeries[] {
  return matches
    .filter((match) => match.rank >= 1 && match.rank <= 3)
    .sort((a, b) => a.rank - b.rank)
    .map((match) => {
      const key = (`rank${match.rank}` as IncomeMilestoneSeries["key"]);
      return {
        key,
        rank: match.rank,
        name: match.name,
        color: INCOME_SERIES_COLORS[key],
      };
    });
}
