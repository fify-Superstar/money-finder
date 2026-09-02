import assert from "node:assert/strict";
import test from "node:test";
import {
  ASSESSMENT_QUESTION_COUNT,
  BUDGET_500_TO_2000,
  INCOME_500_TO_1000,
  QUESTIONS,
  SKILL_WRITING_AND_CONTENT,
  TIME_UNDER_5_HOURS,
  WORKING_STYLE_PEOPLE,
  assessmentReducer,
  createInitialAssessmentState,
  emptyAnswers,
  isValidEmail,
  setAnswer,
  tryAdvance,
  tryGoBack,
  trySubmit,
} from "./engine.ts";
import type { AssessmentAnswers, AssessmentState } from "./types.ts";

function answer<K extends keyof AssessmentAnswers>(
  state: AssessmentState,
  field: K,
  value: AssessmentAnswers[K],
): AssessmentState {
  return setAnswer(state, field, value);
}

function fillRequired(state: AssessmentState): AssessmentState {
  return [
    ["firstName", "Alex"],
    ["email", "alex@example.com"],
    ["goal", "Build a savings buffer/emergency fund"],
    ["time", TIME_UNDER_5_HOURS],
    ["skill", SKILL_WRITING_AND_CONTENT],
    ["budget", BUDGET_500_TO_2000],
    ["workingStyle", WORKING_STYLE_PEOPLE],
    ["techComfort", 4],
    ["riskTolerance", 2],
  ].reduce((current, [field, value]) => {
    return answer(
      current,
      field as keyof AssessmentAnswers,
      value as AssessmentAnswers[keyof AssessmentAnswers],
    );
  }, state);
}

test("required fields cannot be skipped", () => {
  const started = createInitialAssessmentState();
  const skipped = tryAdvance(started);

  assert.equal(skipped.currentIndex, 0);
  assert.equal(skipped.step, "questions");
  assert.match(skipped.validationMessage ?? "", /Please/);
});

test("invalid email cannot be submitted", () => {
  let state = answer(createInitialAssessmentState(), "firstName", "Alex");
  state = tryAdvance(state);
  state = answer(state, "email", "not-an-email");
  state = tryAdvance(state);

  assert.equal(state.currentIndex, 1);
  assert.equal(QUESTIONS[1]?.field, "email");
  assert.equal(isValidEmail(state.answers.email), false);
  assert.match(state.validationMessage ?? "", /valid email/i);
});

test("optional questions can be left blank", () => {
  let state = fillRequired(createInitialAssessmentState());

  for (let i = 0; i < 8; i += 1) {
    state = tryAdvance(state);
  }

  assert.equal(QUESTIONS[state.currentIndex]?.field, "assets");
  state = tryAdvance(state);
  assert.equal(state.answers.assets, "");
  assert.equal(QUESTIONS[state.currentIndex]?.field, "riskTolerance");

  state = tryAdvance(state);
  assert.equal(QUESTIONS[state.currentIndex]?.field, "avoidances");
  assert.deepEqual(state.answers.avoidances, []);
  state = tryAdvance(state);

  assert.equal(QUESTIONS[state.currentIndex]?.field, "desiredIncome");
  assert.equal(state.answers.desiredIncome, "");
  state = tryAdvance(state);
  assert.equal(state.step, "review");
});

test("answers persist when navigating backward", () => {
  let state = answer(createInitialAssessmentState(), "firstName", "Jordan");
  state = tryAdvance(state);
  state = answer(state, "email", "jordan@example.com");
  state = tryAdvance(state);
  state = tryGoBack(state);
  state = tryGoBack(state);

  assert.equal(state.currentIndex, 0);
  assert.equal(state.answers.firstName, "Jordan");
  assert.equal(state.answers.email, "jordan@example.com");
});

test("Under 5 hours is stored exactly as that string", () => {
  const state = answer(createInitialAssessmentState(), "time", TIME_UNDER_5_HOURS);
  assert.equal(state.answers.time, "Under 5 hours");
});

test("Writing and Content Creation is stored exactly as that string", () => {
  const state = answer(
    createInitialAssessmentState(),
    "skill",
    SKILL_WRITING_AND_CONTENT,
  );
  assert.equal(state.answers.skill, "Writing and Content Creation");
});

test("500 - 2000 dollars is stored exactly as that string", () => {
  const state = answer(
    createInitialAssessmentState(),
    "budget",
    BUDGET_500_TO_2000,
  );
  assert.equal(state.answers.budget, "500 - 2000 dollars");
});

test("people-facing working style is stored exactly as that string", () => {
  const state = answer(
    createInitialAssessmentState(),
    "workingStyle",
    WORKING_STYLE_PEOPLE,
  );
  assert.equal(
    state.answers.workingStyle,
    "I prefer interacting with people (in person or online)",
  );
});

test("$500–$1,000 is stored exactly as that string", () => {
  const state = answer(
    createInitialAssessmentState(),
    "desiredIncome",
    INCOME_500_TO_1000,
  );
  assert.equal(state.answers.desiredIncome, "$500–$1,000");
});

test("a complete valid assessment can reach the completion state", () => {
  let state = fillRequired(createInitialAssessmentState());
  state = answer(state, "desiredIncome", INCOME_500_TO_1000);

  for (let i = 0; i < ASSESSMENT_QUESTION_COUNT; i += 1) {
    state = tryAdvance(state);
  }

  assert.equal(state.step, "review");
  state = trySubmit(state, "2026-08-31T00:00:00.000Z");
  assert.equal(state.step, "complete");
  assert.equal(state.submittedAt, "2026-08-31T00:00:00.000Z");
  assert.equal(state.answers.time, "Under 5 hours");
  assert.equal(state.answers.skill, "Writing and Content Creation");
  assert.equal(state.answers.budget, "500 - 2000 dollars");
  assert.equal(
    state.answers.workingStyle,
    "I prefer interacting with people (in person or online)",
  );
  assert.equal(state.answers.desiredIncome, "$500–$1,000");
});

test("reset clears answers, completion, and submittedAt", () => {
  let state = fillRequired(createInitialAssessmentState());
  state = answer(state, "desiredIncome", INCOME_500_TO_1000);

  for (let i = 0; i < ASSESSMENT_QUESTION_COUNT; i += 1) {
    state = tryAdvance(state);
  }

  state = trySubmit(state, "2026-08-31T00:00:00.000Z");
  assert.equal(state.step, "complete");

  state = assessmentReducer(state, { type: "reset" });
  assert.equal(state.step, "questions");
  assert.equal(state.currentIndex, 0);
  assert.equal(state.submittedAt, null);
  assert.equal(state.validationMessage, null);
  assert.deepEqual(state.answers, emptyAnswers());
});
