"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { QUESTIONS } from "@/lib/assessment";
import type { AssessmentAnswers } from "@/lib/assessment/types";

type AssessmentReviewProps = {
  answers: AssessmentAnswers;
  onEdit: (index: number) => void;
  onBack: () => void;
  onSubmit: () => void;
};

function formatAnswer(
  field: keyof AssessmentAnswers,
  answers: AssessmentAnswers,
): string {
  const value = answers[field];

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "Not provided";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value !== "string" || !value.trim()) {
    return "Not provided";
  }

  return value;
}

export function AssessmentReview({
  answers,
  onEdit,
  onBack,
  onSubmit,
}: AssessmentReviewProps) {
  return (
    <div className="space-y-6">
      <Card as="section" className="space-y-5">
        <h2 className="font-display text-2xl tracking-tight">
          Review your answers
        </h2>
        <p className="text-muted">
          Check these details, then submit. We will use your answers to create
          your personalised Money Map. You can continue to see your results.
          Matches are not a guarantee of income.
        </p>
        <ol className="space-y-4">
          {QUESTIONS.map((question, index) => (
            <li
              key={question.field}
              className="flex flex-col gap-2 border-b border-line/80 pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
            >
              <div>
                <p className="text-sm text-muted">
                  {question.number}. {question.prompt}
                </p>
                <p className="mt-1 font-medium">
                  {formatAnswer(question.field, answers)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(index)}
              >
                Edit
              </Button>
            </li>
          ))}
        </ol>
      </Card>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onSubmit}>Submit assessment</Button>
      </div>
    </div>
  );
}
