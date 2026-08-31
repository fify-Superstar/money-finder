/**
 * Exact-string V10 assessment labels → canonical V9 Mapping Matrix / catalog labels.
 * Unknown values, "Other", and unmatched V10-only options pass through unchanged.
 */

const GOAL_TO_V9: Readonly<Record<string, string>> = {
  "Replace my full-time salary": "Replace my full-time salary",
  "Generate secondary side income": "Generate a secondary side income",
  "Build a savings buffer/emergency fund":
    "Build a savings buffer or emergency fund",
  "Pay down debt": "Pay off specific debt",
};

const SKILL_TO_V9: Readonly<Record<string, string>> = {
  "Writing and Content Creation": "Writing and Content Creation",
  "Design and Creative": "Design and Creative Arts",
  "Administration and Organisation": "Administrative and Organizational",
  "Technology and Digital": "Technical/Coding/IT",
  "Sales and Communication": "Sales, Marketing, or Customer Service",
  "Teaching and Coaching": "Teaching or Consulting",
  "Practical / Hands-on Skills": "Manual Labor or Physical Services",
};

const WORKING_STYLE_TO_V9: Readonly<Record<string, string>> = {
  "I prefer interacting with people (in person or online)":
    "I prefer interacting with people (in person or online)",
  "I prefer working independently": "I prefer working alone remotely",
};

function lookup(table: Readonly<Record<string, string>>, value: string): string {
  return table[value] ?? value;
}

export function normalizeGoal(goal: string): string {
  return lookup(GOAL_TO_V9, goal);
}

export function normalizeSkill(skill: string): string {
  return lookup(SKILL_TO_V9, skill);
}

export function normalizeWorkingStyle(workingStyle: string): string {
  return lookup(WORKING_STYLE_TO_V9, workingStyle);
}
