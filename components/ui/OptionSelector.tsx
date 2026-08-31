"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import type { QuestionOption } from "@/lib/assessment/types";

type OptionSelectorProps = {
  name: string;
  legend: string;
  options: QuestionOption[];
  value: string | null;
  onChange?: (optionId: string) => void;
  disabled?: boolean;
};

export function OptionSelector({
  name,
  legend,
  options,
  value,
  onChange,
  disabled = false,
}: OptionSelectorProps) {
  if (options.length === 0) {
    return (
      <EmptyState
        title="No answer options yet"
        description="Choices will appear here once assessment questions are loaded from the Money Finder specification."
      />
    );
  }

  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => {
        const checked = value === option.id;
        const optionId = `${name}-${option.id}`;

        return (
          <label
            key={option.id}
            htmlFor={optionId}
            className={cn(
              "flex min-h-12 cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3",
              "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-moss",
              checked
                ? "border-moss bg-paper"
                : "border-line bg-cream/80 hover:border-moss/50",
              disabled && "cursor-not-allowed opacity-70",
            )}
          >
            <input
              id={optionId}
              type="radio"
              name={name}
              value={option.id}
              checked={checked}
              disabled={disabled}
              onChange={() => onChange?.(option.id)}
              className="mt-1 size-4 accent-[#1d5a3e]"
            />
            <span className="leading-relaxed">{option.label}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
