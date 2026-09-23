import assert from "node:assert/strict";
import test from "node:test";
import {
  buildIncomeMilestonePoints,
  buildIncomeMilestoneSeries,
} from "./incomeMilestones.ts";
import type { MoneyMapMatch } from "./types.ts";

function match(
  rank: number,
  score: number,
  min: number,
  max: number,
): MoneyMapMatch {
  return {
    id: `id-${rank}`,
    rank,
    name: `Fit ${rank}`,
    score,
    explanation: "Eligible match.",
    incomePotentialMin: min,
    incomePotentialMax: max,
    milestones: [{ label: "a" }, { label: "b" }, { label: "c" }],
    actions: [{ label: "x" }, { label: "y" }, { label: "z" }],
  };
}

test("income milestones ramp across 12 months from listed ranges and scores", () => {
  const points = buildIncomeMilestonePoints([
    match(1, 100, 1000, 1000),
    match(2, 50, 800, 800),
  ]);

  assert.equal(points.length, 12);
  assert.equal(points[0]?.month, "M1");
  assert.equal(points[11]?.month, "M12");
  assert.ok((points[0]?.rank1 ?? 0) < (points[11]?.rank1 ?? 0));
  assert.ok((points[0]?.rank1 ?? 0) > 100);
  assert.equal(points[11]?.rank1, 1000);
  assert.equal(points[11]?.rank2, 400);
  assert.equal(points[11]?.rank3, 0);
  assert.equal(points[11]?.combined, 1400);
});

test("income milestone series uses rank colours for the Top 3", () => {
  const series = buildIncomeMilestoneSeries([
    match(2, 70, 500, 1000),
    match(1, 90, 500, 1000),
  ]);

  assert.equal(series[0]?.key, "rank1");
  assert.equal(series[0]?.color, "#1d5a3e");
  assert.equal(series[1]?.key, "rank2");
  assert.equal(series[1]?.color, "#12c98d");
});
