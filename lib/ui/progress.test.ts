import assert from "node:assert/strict";
import test from "node:test";
import { clampProgress, progressLabel } from "./progress.ts";

test("clamps progress and calculates percent", () => {
  assert.deepEqual(clampProgress(3, 12), { value: 3, max: 12, percent: 25 });
  assert.deepEqual(clampProgress(-2, 12), { value: 0, max: 12, percent: 0 });
  assert.deepEqual(clampProgress(20, 12), { value: 12, max: 12, percent: 100 });
  assert.deepEqual(clampProgress(1, 0), { value: 0, max: 0, percent: 0 });
});

test("builds an accessible progress label", () => {
  assert.equal(progressLabel(1, 12), "Question 1 of 12");
});
