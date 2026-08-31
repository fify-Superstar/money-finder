"use client";

import { OptionSelector } from "@/components/ui/OptionSelector";
import { ScaleSelector } from "@/components/ui/ScaleSelector";
import { TextArea } from "@/components/ui/TextArea";
import { TextField } from "@/components/ui/TextField";
import type { AssessmentAnswers, QuestionDefinition } from "@/lib/assessment/types";

type QuestionFieldProps = {
  question: QuestionDefinition;
  answers: AssessmentAnswers;
  error?: string | null;
  onChange: <K extends keyof AssessmentAnswers>(
    field: K,
    value: AssessmentAnswers[K],
  ) => void;
};

export function QuestionField({
  question,
  answers,
  error,
  onChange,
}: QuestionFieldProps) {
  const inputId = `question-${question.field}`;

  if (question.type === "short" || question.type === "email") {
    const value =
      question.field === "firstName" || question.field === "email"
        ? answers[question.field]
        : "";

    return (
      <TextField
        id={inputId}
        label={question.prompt}
        hideLabel
        type={question.type === "email" ? "email" : "text"}
        autoComplete={question.autoComplete}
        inputMode={question.type === "email" ? "email" : undefined}
        value={value}
        error={error}
        required={question.required}
        onChange={(event) => {
          if (question.field === "firstName" || question.field === "email") {
            onChange(question.field, event.target.value);
          }
        }}
      />
    );
  }

  if (question.type === "long") {
    return (
      <TextArea
        id={inputId}
        label={question.prompt}
        hideLabel
        value={answers.assets}
        required={question.required}
        onChange={(event) => onChange("assets", event.target.value)}
      />
    );
  }

  if (question.type === "scale") {
    const value =
      question.field === "techComfort" || question.field === "riskTolerance"
        ? answers[question.field]
        : null;

    return (
      <ScaleSelector
        name={inputId}
        label={question.scaleLabel ?? "Scale"}
        lowLabel={question.scaleLowLabel ?? "Low"}
        highLabel={question.scaleHighLabel ?? "High"}
        value={value}
        onChange={(score) => {
          if (
            question.field === "techComfort" ||
            question.field === "riskTolerance"
          ) {
            onChange(question.field, score);
          }
        }}
      />
    );
  }

  if (question.type === "multiple") {
    return (
      <OptionSelector
        name={inputId}
        legend={question.prompt}
        options={question.options ?? []}
        mode="multiple"
        value={answers.avoidances}
        onChange={(next) =>
          onChange("avoidances", Array.isArray(next) ? next : [next])
        }
      />
    );
  }

  const current =
    typeof answers[question.field] === "string"
      ? (answers[question.field] as string)
      : "";

  return (
    <OptionSelector
      name={inputId}
      legend={question.prompt}
      options={question.options ?? []}
      mode="single"
      value={current || null}
      onChange={(next) => {
        if (typeof next === "string") {
          onChange(question.field, next as AssessmentAnswers[typeof question.field]);
        }
      }}
    />
  );
}
