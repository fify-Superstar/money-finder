import assert from "node:assert/strict";
import test from "node:test";
import {
  ASSESSMENT_QUESTION_COUNT,
  answeredCount,
  assessmentReducer,
  createInitialAssessmentState,
  questionsAreLoaded,
  questionSlotId,
  selectedOptionId,
} from "./state.ts";

test("creates 12 empty question slots without invented prompts", () => {
  const state = createInitialAssessmentState();

  assert.equal(state.totalQuestions, ASSESSMENT_QUESTION_COUNT);
  assert.equal(state.slots.length, 12);
  assert.equal(state.currentIndex, 0);
  assert.equal(state.status, "unloaded");
  assert.equal(questionsAreLoaded(state), false);
  assert.ok(state.slots.every((slot) => slot.prompt === null));
  assert.ok(state.slots.every((slot) => slot.options.length === 0));
  assert.equal(state.slots[0]?.id, questionSlotId(0));
  assert.equal(state.slots[11]?.id, "q-12");
});

test("stores answers against slot ids and ignores unknown questions", () => {
  const initial = createInitialAssessmentState();
  const answered = assessmentReducer(initial, {
    type: "setAnswer",
    questionId: "q-01",
    value: "option-a",
  });
  const ignored = assessmentReducer(answered, {
    type: "setAnswer",
    questionId: "unknown",
    value: "nope",
  });

  assert.equal(selectedOptionId(answered.answers["q-01"] ?? null), "option-a");
  assert.equal(answeredCount(answered), 1);
  assert.equal(ignored.answers["unknown"], undefined);
});

test("moves between question slots within bounds", () => {
  const initial = createInitialAssessmentState();
  const next = assessmentReducer(initial, { type: "next" });
  const back = assessmentReducer(next, { type: "back" });
  const last = assessmentReducer(initial, { type: "goTo", index: 99 });
  const first = assessmentReducer(last, { type: "goTo", index: -3 });

  assert.equal(next.currentIndex, 1);
  assert.equal(back.currentIndex, 0);
  assert.equal(last.currentIndex, 11);
  assert.equal(first.currentIndex, 0);
});
