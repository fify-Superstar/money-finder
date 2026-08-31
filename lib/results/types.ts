export type MoneyMapStep = {
  label: string;
};

export type MoneyMapMatch = {
  id: string;
  rank: number;
  name: string;
  score: number;
  explanation: string;
  milestones: [MoneyMapStep, MoneyMapStep, MoneyMapStep];
  actions: [MoneyMapStep, MoneyMapStep, MoneyMapStep];
};

export type MoneyMap = {
  firstName: string;
  insight: string;
  matches: MoneyMapMatch[];
};

export type MoneyMapViewModel =
  | { status: "loading" }
  | { status: "missing-assessment" }
  | { status: "catalog-unavailable"; firstName: string }
  | { status: "no-eligible"; firstName: string; insight: string }
  | { status: "ready"; map: MoneyMap };
