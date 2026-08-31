export type SelectionMode = "single" | "multiple";

export type AnswerValue = string | string[] | null;

export type QuestionOption = {
  id: string;
  label: string;
};

/**
 * A numbered slot in the 12-question assessment.
 * `prompt` and `options` stay empty until the V9 specification is loaded.
 * Do not invent final question copy here.
 */
export type QuestionSlot = {
  id: string;
  index: number;
  prompt: string | null;
  helpText: string | null;
  options: QuestionOption[];
  selection: SelectionMode;
};

export type AssessmentStatus = "unloaded" | "loading" | "ready" | "error";

export type AssessmentState = {
  totalQuestions: number;
  currentIndex: number;
  slots: QuestionSlot[];
  answers: Record<string, AnswerValue>;
  status: AssessmentStatus;
  errorMessage: string | null;
};

export type AssessmentAction =
  | { type: "next" }
  | { type: "back" }
  | { type: "goTo"; index: number }
  | { type: "setAnswer"; questionId: string; value: AnswerValue }
  | { type: "setStatus"; status: AssessmentStatus; errorMessage?: string | null };
