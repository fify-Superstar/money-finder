"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import {
  assessmentReducer,
  createInitialAssessmentState,
  hasEnteredAnswers,
  trySubmit,
} from "./engine";
import {
  ASSESSMENT_RETAKE_PARAM,
  isAssessmentRetakeRequest,
  readStoredAssessment,
  resetStoredAssessment,
  writeStoredAssessment,
} from "./persist";
import type { AssessmentAnswers, AssessmentState } from "./types";

type AssessmentContextValue = {
  state: AssessmentState;
  setAnswer: <K extends keyof AssessmentAnswers>(
    field: K,
    value: AssessmentAnswers[K],
  ) => void;
  next: () => void;
  back: () => void;
  goToQuestion: (index: number) => void;
  submit: () => boolean;
};

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    assessmentReducer,
    undefined,
    createInitialAssessmentState,
  );
  const didHydrate = useRef(false);
  const persistReady = useRef(false);

  useEffect(() => {
    if (didHydrate.current) {
      return;
    }
    didHydrate.current = true;

    if (isAssessmentRetakeRequest(window.location.search)) {
      resetStoredAssessment();
      dispatch({ type: "reset" });
      const url = new URL(window.location.href);
      url.searchParams.delete(ASSESSMENT_RETAKE_PARAM);
      window.history.replaceState(
        window.history.state,
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
      return;
    }

    const stored = readStoredAssessment();
    if (stored) {
      dispatch({ type: "hydrate", state: stored });
    }
  }, []);

  useEffect(() => {
    if (!persistReady.current) {
      persistReady.current = true;
      return;
    }
    writeStoredAssessment(state);
  }, [state]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (state.step !== "complete" && hasEnteredAnswers(state.answers)) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [state.answers, state.step]);

  const value = useMemo<AssessmentContextValue>(
    () => ({
      state,
      setAnswer: (field, value) =>
        dispatch({ type: "setAnswer", field, value }),
      next: () => dispatch({ type: "advance" }),
      back: () => dispatch({ type: "back" }),
      goToQuestion: (index) => dispatch({ type: "goToQuestion", index }),
      submit: () => {
        const submittedAt = new Date().toISOString();
        const nextState = trySubmit(state, submittedAt);
        dispatch({ type: "submit", submittedAt });
        writeStoredAssessment(nextState);
        return nextState.step === "complete";
      },
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
