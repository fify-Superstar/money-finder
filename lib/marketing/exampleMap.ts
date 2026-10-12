import type { AssessmentAnswers } from "../assessment/types.ts";
import { matchAssessment } from "../matching/match.ts";

/** Fictional inputs, evaluated by the same engine as paid assessments. */
export const exampleAnswers: AssessmentAnswers = {
  firstName: "Alex",
  email: "",
  goal: "Generate a secondary side income",
  time: "Under 5 hours",
  skill: "Writing and Content Creation",
  budget: "100 - 500 dollars",
  workingStyle: "I prefer project-based work with deadlines",
  techComfort: 3,
  assets: "",
  riskTolerance: 2,
  avoidances: [],
  desiredIncome: "",
};

export const exampleMatches = matchAssessment(exampleAnswers).top3;
