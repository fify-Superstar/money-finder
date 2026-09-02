export type QuestionType =
  | "short"
  | "email"
  | "single"
  | "multiple"
  | "scale"
  | "long";

export type AssessmentAnswers = {
  firstName: string;
  email: string;
  goal: string;
  time: string;
  skill: string;
  budget: string;
  workingStyle: string;
  techComfort: number | null;
  assets: string;
  riskTolerance: number | null;
  avoidances: string[];
  desiredIncome: string;
};

export type QuestionDefinition = {
  field: keyof AssessmentAnswers;
  number: number;
  prompt: string;
  required: boolean;
  type: QuestionType;
  options?: readonly string[];
  scaleLabel?: string;
  scaleLowLabel?: string;
  scaleHighLabel?: string;
  helpText?: string;
  autoComplete?: string;
};

export type AssessmentStep = "questions" | "review" | "complete";

export type AssessmentState = {
  currentIndex: number;
  step: AssessmentStep;
  answers: AssessmentAnswers;
  validationMessage: string | null;
  submittedAt: string | null;
};

export type AnswerValue = string | string[] | number | null;

export type AssessmentAction =
  | {
      type: "setAnswer";
      field: keyof AssessmentAnswers;
      value: AssessmentAnswers[keyof AssessmentAnswers];
    }
  | { type: "advance" }
  | { type: "back" }
  | { type: "goToQuestion"; index: number }
  | { type: "submit"; submittedAt: string }
  | { type: "hydrate"; state: AssessmentState }
  | { type: "reset" }
  | { type: "clearValidation" };
