"use client";

import { cn } from "@/lib/cn";

type OptionSelectorProps = {
  name: string;
  legend: string;
  options: readonly string[];
  value: string | string[] | null;
  mode?: "single" | "multiple";
  onChange?: (value: string | string[]) => void;
  disabled?: boolean;
};

export function OptionSelector({
  name,
  legend,
  options,
  value,
  mode = "single",
  onChange,
  disabled = false,
}: OptionSelectorProps) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];

  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="sr-only">{legend}</legend>
      {options.map((option, index) => {
        const checked = selected.includes(option);
        const optionId = `${name}-option-${index}`;

        return (
          <label
            key={option}
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
              type={mode === "multiple" ? "checkbox" : "radio"}
              name={mode === "multiple" ? `${name}-${index}` : name}
              value={option}
              checked={checked}
              disabled={disabled}
              onChange={() => {
                if (mode === "multiple") {
                  const next = checked
                    ? selected.filter((item) => item !== option)
                    : [...selected, option];
                  onChange?.(next);
                  return;
                }
                onChange?.(option);
              }}
              className="mt-1 size-4 accent-[#1d5a3e]"
            />
            <span className="leading-relaxed">{option}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
