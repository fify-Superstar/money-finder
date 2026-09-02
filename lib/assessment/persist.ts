import type { AssessmentState } from "./types";
import { createInitialAssessmentState, emptyAnswers } from "./engine.ts";

export const ASSESSMENT_STORAGE_KEY = "money-finder-v10.assessment";
export const ASSESSMENT_RETAKE_PARAM = "retake";
export const ASSESSMENT_RETAKE_HREF = `/assessment?${ASSESSMENT_RETAKE_PARAM}=1`;

export function isAssessmentRetakeRequest(search: string): boolean {
  const query = search.startsWith("?") ? search.slice(1) : search;
  return new URLSearchParams(query).get(ASSESSMENT_RETAKE_PARAM) === "1";
}

type StoredAssessment = {
  version: 1;
  currentIndex: number;
  step: AssessmentState["step"];
  answers: AssessmentState["answers"];
  submittedAt: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function serializeAssessment(state: AssessmentState): string {
  const payload: StoredAssessment = {
    version: 1,
    currentIndex: state.currentIndex,
    step: state.step,
    answers: state.answers,
    submittedAt: state.submittedAt,
  };

  return JSON.stringify(payload);
}

export function parseStoredAssessment(raw: string): AssessmentState | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== 1 || !isRecord(parsed.answers)) {
      return null;
    }

    const base = createInitialAssessmentState();
    const answers = { ...emptyAnswers(), ...parsed.answers };

    const step =
      parsed.step === "review" || parsed.step === "complete" || parsed.step === "questions"
        ? parsed.step
        : "questions";

    return {
      ...base,
      currentIndex:
        typeof parsed.currentIndex === "number" ? parsed.currentIndex : 0,
      step,
      answers: {
        ...answers,
        avoidances: Array.isArray(answers.avoidances) ? answers.avoidances : [],
        techComfort:
          typeof answers.techComfort === "number" ? answers.techComfort : null,
        riskTolerance:
          typeof answers.riskTolerance === "number"
            ? answers.riskTolerance
            : null,
      },
      submittedAt:
        typeof parsed.submittedAt === "string" ? parsed.submittedAt : null,
      validationMessage: null,
    };
  } catch {
    return null;
  }
}

export function readStoredAssessment(): AssessmentState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(ASSESSMENT_STORAGE_KEY);
  return raw ? parseStoredAssessment(raw) : null;
}

export function writeStoredAssessment(state: AssessmentState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    ASSESSMENT_STORAGE_KEY,
    serializeAssessment(state),
  );
}

export function resetStoredAssessment(): AssessmentState {
  const fresh = createInitialAssessmentState();
  writeStoredAssessment(fresh);
  return fresh;
}
