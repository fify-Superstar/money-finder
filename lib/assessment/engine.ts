import type {
  AssessmentAction,
  AssessmentAnswers,
  AssessmentState,
  QuestionDefinition,
} from "./types";

export const ASSESSMENT_QUESTION_COUNT = 12;

export const TIME_UNDER_5_HOURS = "Under 5 hours";
export const SKILL_WRITING_AND_CONTENT = "Writing and Content Creation";
export const BUDGET_500_TO_2000 = "500 - 2000 dollars";
export const WORKING_STYLE_PEOPLE =
  "I prefer interacting with people (in person or online)";
export const INCOME_500_TO_1000 = "$500–$1,000";

export const GOAL_OPTIONS = [
  "Replace my full-time salary",
  "Generate secondary side income",
  "Build a savings buffer/emergency fund",
  "Pay down debt",
  "Build a business",
  "Create more financial freedom",
  "Other",
] as const;

export const TIME_OPTIONS = [
  TIME_UNDER_5_HOURS,
  "5–10 hours",
  "10–20 hours",
  "20+ hours",
] as const;

export const SKILL_OPTIONS = [
  SKILL_WRITING_AND_CONTENT,
  "Design and Creative",
  "Technology and Digital",
  "Sales and Communication",
  "Administration and Organisation",
  "Teaching and Coaching",
  "Practical / Hands-on Skills",
  "Other",
] as const;

export const BUDGET_OPTIONS = [
  "0 dollars",
  "100 - 500 dollars",
  BUDGET_500_TO_2000,
  "2000+ dollars",
] as const;

export const WORKING_STYLE_OPTIONS = [
  WORKING_STYLE_PEOPLE,
  "I prefer working independently",
  "I prefer a mix of both",
] as const;

export const INCOME_OPTIONS = [
  "Under $500",
  INCOME_500_TO_1000,
  "$1,000–$2,000",
  "$2,000–$5,000",
  "$5,000+",
] as const;

export const AVOIDANCE_OPTIONS = [
  "Cold calling or hard selling",
  "Being on camera",
  "Creating social media content",
  "Managing other people",
  "Unpredictable income",
  "High upfront costs",
  "Physically demanding work",
  "Working evenings or weekends",
  "A long unpaid learning period",
  "Public speaking",
] as const;

export function emptyAnswers(): AssessmentAnswers {
  return {
    firstName: "",
    email: "",
    goal: "",
    time: "",
    skill: "",
    budget: "",
    workingStyle: "",
    techComfort: null,
    assets: "",
    riskTolerance: null,
    avoidances: [],
    desiredIncome: "",
  };
}

export const QUESTIONS: readonly QuestionDefinition[] = [
  {
    field: "firstName",
    number: 1,
    prompt: "First name",
    required: true,
    type: "short",
    autoComplete: "given-name",
    helpText: "We’ll use this to personalise your Money Map.",
  },
  {
    field: "email",
    number: 2,
    prompt: "Email address",
    required: true,
    type: "email",
    autoComplete: "email",
    helpText: "We only use this to return your results. We will not sell it.",
  },
  {
    field: "goal",
    number: 3,
    prompt: "What is your primary financial goal for the next 6 months?",
    required: true,
    type: "single",
    options: GOAL_OPTIONS,
  },
  {
    field: "time",
    number: 4,
    prompt:
      "How many hours per week can you realistically dedicate to a new income stream?",
    required: true,
    type: "single",
    options: TIME_OPTIONS,
  },
  {
    field: "skill",
    number: 5,
    prompt: "Which best describes your current skill set?",
    required: true,
    type: "single",
    options: SKILL_OPTIONS,
  },
  {
    field: "budget",
    number: 6,
    prompt:
      "What initial budget could realistically be put toward starting an income stream?",
    required: true,
    type: "single",
    options: BUDGET_OPTIONS,
  },
  {
    field: "workingStyle",
    number: 7,
    prompt: "What working style do you prefer?",
    required: true,
    type: "single",
    options: WORKING_STYLE_OPTIONS,
  },
  {
    field: "techComfort",
    number: 8,
    prompt: "Rate your comfort level with learning new technology/software.",
    required: true,
    type: "scale",
    scaleLabel: "Technology",
    scaleLowLabel: "Not comfortable",
    scaleHighLabel: "Very comfortable",
  },
  {
    field: "assets",
    number: 9,
    prompt: "What existing assets, resources or experience could you use?",
    required: false,
    type: "long",
    helpText: "Optional. Tools, audience, qualifications, equipment, or know-how.",
  },
  {
    field: "riskTolerance",
    number: 10,
    prompt: "Rate your risk tolerance for a new income venture.",
    required: true,
    type: "scale",
    scaleLabel: "Risk",
    scaleLowLabel: "Very cautious",
    scaleHighLabel: "Comfortable with risk",
  },
  {
    field: "avoidances",
    number: 11,
    prompt: "What would you most like to avoid?",
    required: false,
    type: "multiple",
    options: AVOIDANCE_OPTIONS,
    helpText: "Optional. Select as many as apply.",
  },
  {
    field: "desiredIncome",
    number: 12,
    prompt:
      "How much additional income would you ideally like to generate per month?",
    required: false,
    type: "single",
    options: INCOME_OPTIONS,
    helpText: "Optional. This helps later matching. It is not a promise of income.",
  },
];

export function createInitialAssessmentState(): AssessmentState {
  return {
    currentIndex: 0,
    step: "questions",
    answers: emptyAnswers(),
    validationMessage: null,
    submittedAt: null,
  };
}

export function currentQuestion(
  state: AssessmentState,
): QuestionDefinition {
  return QUESTIONS[state.currentIndex] ?? QUESTIONS[0];
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function fieldValue(
  answers: AssessmentAnswers,
  field: keyof AssessmentAnswers,
): AssessmentAnswers[keyof AssessmentAnswers] {
  return answers[field];
}

export function isQuestionAnswered(
  question: QuestionDefinition,
  answers: AssessmentAnswers,
): boolean {
  const value = fieldValue(answers, question.field);

  if (typeof value === "number") {
    return Number.isInteger(value) && value >= 1 && value <= 5;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value !== "string") {
    return false;
  }

  return value.trim().length > 0;
}

export function validateQuestion(
  question: QuestionDefinition,
  answers: AssessmentAnswers,
): string | null {
  const value = fieldValue(answers, question.field);

  if (question.type === "email") {
    const email = typeof value === "string" ? value.trim() : "";
    if (!email) {
      return "Please enter your email address to continue.";
    }
    if (!isValidEmail(email)) {
      return "Please enter a valid email address.";
    }
    return null;
  }

  if (question.required && !isQuestionAnswered(question, answers)) {
    return "Please answer this question to continue.";
  }

  return null;
}

export function validateCurrentQuestion(state: AssessmentState): string | null {
  return validateQuestion(currentQuestion(state), state.answers);
}

export function missingRequiredQuestions(
  answers: AssessmentAnswers,
): QuestionDefinition[] {
  return QUESTIONS.filter(
    (question) => question.required && validateQuestion(question, answers),
  );
}

export function setAnswer(
  state: AssessmentState,
  field: keyof AssessmentAnswers,
  value: AssessmentAnswers[keyof AssessmentAnswers],
): AssessmentState {
  return {
    ...state,
    answers: {
      ...state.answers,
      [field]: value,
    },
    validationMessage: null,
  };
}

export function tryAdvance(
  state: AssessmentState,
): AssessmentState {
  if (state.step !== "questions") {
    return state;
  }

  const message = validateCurrentQuestion(state);
  if (message) {
    return { ...state, validationMessage: message };
  }

  if (state.currentIndex >= ASSESSMENT_QUESTION_COUNT - 1) {
    return {
      ...state,
      step: "review",
      validationMessage: null,
    };
  }

  return {
    ...state,
    currentIndex: state.currentIndex + 1,
    validationMessage: null,
  };
}

export function tryGoBack(state: AssessmentState): AssessmentState {
  if (state.step === "complete") {
    return state;
  }

  if (state.step === "review") {
    return {
      ...state,
      step: "questions",
      currentIndex: ASSESSMENT_QUESTION_COUNT - 1,
      validationMessage: null,
    };
  }

  return {
    ...state,
    currentIndex: Math.max(state.currentIndex - 1, 0),
    validationMessage: null,
  };
}

export function goToQuestion(
  state: AssessmentState,
  index: number,
): AssessmentState {
  const currentIndex = Math.min(
    Math.max(0, index),
    ASSESSMENT_QUESTION_COUNT - 1,
  );

  return {
    ...state,
    step: "questions",
    currentIndex,
    validationMessage: null,
  };
}

export function trySubmit(
  state: AssessmentState,
  submittedAt: string,
): AssessmentState {
  const missing = missingRequiredQuestions(state.answers);
  if (missing.length > 0) {
    const first = missing[0];
    return {
      ...state,
      step: "questions",
      currentIndex: first.number - 1,
      validationMessage: `Please complete: ${first.prompt}.`,
    };
  }

  return {
    ...state,
    step: "complete",
    submittedAt,
    validationMessage: null,
    answers: {
      ...state.answers,
      firstName: state.answers.firstName.trim(),
      email: state.answers.email.trim(),
      assets: state.answers.assets.trim(),
    },
  };
}

export function toggleAvoidance(
  current: string[],
  option: string,
): string[] {
  return current.includes(option)
    ? current.filter((item) => item !== option)
    : [...current, option];
}

export function assessmentReducer(
  state: AssessmentState,
  action: AssessmentAction,
): AssessmentState {
  switch (action.type) {
    case "setAnswer":
      return setAnswer(state, action.field, action.value);
    case "advance":
      return tryAdvance(state);
    case "back":
      return tryGoBack(state);
    case "goToQuestion":
      return goToQuestion(state, action.index);
    case "submit":
      return trySubmit(state, action.submittedAt);
    case "hydrate":
      return {
        ...action.state,
        validationMessage: null,
      };
    case "clearValidation":
      return { ...state, validationMessage: null };
    default:
      return state;
  }
}

export function hasEnteredAnswers(answers: AssessmentAnswers): boolean {
  return (
    answers.firstName.trim() !== "" ||
    answers.email.trim() !== "" ||
    answers.goal !== "" ||
    answers.time !== "" ||
    answers.skill !== "" ||
    answers.budget !== "" ||
    answers.workingStyle !== "" ||
    answers.techComfort !== null ||
    answers.assets.trim() !== "" ||
    answers.riskTolerance !== null ||
    answers.avoidances.length > 0 ||
    answers.desiredIncome !== ""
  );
}
