import type {
  AnswerValue,
  AssessmentAction,
  AssessmentState,
  QuestionSlot,
} from "./types";

export const ASSESSMENT_QUESTION_COUNT = 12;

export function questionSlotId(index: number): string {
  return `q-${String(index + 1).padStart(2, "0")}`;
}

export function createQuestionSlots(
  count: number = ASSESSMENT_QUESTION_COUNT,
): QuestionSlot[] {
  return Array.from({ length: count }, (_, index) => ({
    id: questionSlotId(index),
    index,
    prompt: null,
    helpText: null,
    options: [],
    selection: "single",
  }));
}

export function createInitialAssessmentState(
  count: number = ASSESSMENT_QUESTION_COUNT,
): AssessmentState {
  const slots = createQuestionSlots(count);

  return {
    totalQuestions: slots.length,
    currentIndex: 0,
    slots,
    answers: Object.fromEntries(slots.map((slot) => [slot.id, null])),
    status: "unloaded",
    errorMessage: null,
  };
}

export function questionsAreLoaded(state: AssessmentState): boolean {
  return state.slots.every(
    (slot) => slot.prompt !== null && slot.options.length > 0,
  );
}

export function isAnswered(value: AnswerValue): boolean {
  if (value === null) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value.length > 0;
}

export function answeredCount(state: AssessmentState): number {
  return Object.values(state.answers).filter(isAnswered).length;
}

export function selectedOptionId(value: AnswerValue): string | null {
  return typeof value === "string" ? value : null;
}

export function currentSlot(state: AssessmentState): QuestionSlot {
  return state.slots[state.currentIndex] ?? state.slots[0];
}

export function assessmentReducer(
  state: AssessmentState,
  action: AssessmentAction,
): AssessmentState {
  switch (action.type) {
    case "next": {
      return {
        ...state,
        currentIndex: Math.min(state.currentIndex + 1, state.totalQuestions - 1),
      };
    }
    case "back": {
      return {
        ...state,
        currentIndex: Math.max(state.currentIndex - 1, 0),
      };
    }
    case "goTo": {
      const index = Math.min(
        Math.max(0, action.index),
        state.totalQuestions - 1,
      );
      return { ...state, currentIndex: index };
    }
    case "setAnswer": {
      if (!(action.questionId in state.answers)) {
        return state;
      }

      return {
        ...state,
        answers: {
          ...state.answers,
          [action.questionId]: action.value,
        },
      };
    }
    case "setStatus": {
      return {
        ...state,
        status: action.status,
        errorMessage:
          action.status === "error"
            ? (action.errorMessage ?? "The assessment could not be loaded.")
            : null,
      };
    }
    default: {
      return state;
    }
  }
}
