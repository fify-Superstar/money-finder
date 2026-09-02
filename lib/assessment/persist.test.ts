import assert from "node:assert/strict";
import test from "node:test";
import {
  createInitialAssessmentState,
  emptyAnswers,
} from "./engine.ts";
import {
  ASSESSMENT_RETAKE_HREF,
  isAssessmentRetakeRequest,
  parseStoredAssessment,
  serializeAssessment,
} from "./persist.ts";
import type { AssessmentState } from "./types.ts";

test("retake query is only recognised as retake=1", () => {
  assert.equal(isAssessmentRetakeRequest("?retake=1"), true);
  assert.equal(isAssessmentRetakeRequest("retake=1"), true);
  assert.equal(isAssessmentRetakeRequest("?retake=true"), false);
  assert.equal(isAssessmentRetakeRequest(""), false);
  assert.equal(isAssessmentRetakeRequest("?ref=abc"), false);
  assert.equal(ASSESSMENT_RETAKE_HREF, "/assessment?retake=1");
});

test("a reset payload serialises as a fresh question-1 assessment", () => {
  const complete: AssessmentState = {
    ...createInitialAssessmentState(),
    currentIndex: 11,
    step: "complete",
    submittedAt: "2026-08-31T00:00:00.000Z",
    answers: {
      ...emptyAnswers(),
      firstName: "Test Customer 1",
      email: "test@example.com",
    },
  };

  const restoredComplete = parseStoredAssessment(serializeAssessment(complete));
  assert.equal(restoredComplete?.step, "complete");
  assert.equal(restoredComplete?.answers.firstName, "Test Customer 1");

  const fresh = parseStoredAssessment(
    serializeAssessment(createInitialAssessmentState()),
  );
  assert.equal(fresh?.step, "questions");
  assert.equal(fresh?.currentIndex, 0);
  assert.equal(fresh?.submittedAt, null);
  assert.deepEqual(fresh?.answers, emptyAnswers());
});
