"use client";

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { assessmentReducer, createInitialAssessmentState } from "./state";
import type { AnswerValue, AssessmentState } from "./types";

type AssessmentContextValue = {
  state: AssessmentState;
  next: () => void;
  back: () => void;
  goTo: (index: number) => void;
  setAnswer: (questionId: string, value: AnswerValue) => void;
};

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    assessmentReducer,
    undefined,
    createInitialAssessmentState,
  );

  const value = useMemo<AssessmentContextValue>(
    () => ({
      state,
      next: () => dispatch({ type: "next" }),
      back: () => dispatch({ type: "back" }),
      goTo: (index: number) => dispatch({ type: "goTo", index }),
      setAnswer: (questionId, answerValue) =>
        dispatch({ type: "setAnswer", questionId, value: answerValue }),
    }),
    [state],
  );

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment(): AssessmentContextValue {
  const context = useContext(AssessmentContext);

  if (!context) {
    throw new Error("useAssessment must be used within AssessmentProvider.");
  }

  return context;
}
