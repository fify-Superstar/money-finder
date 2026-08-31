"use client";

import { cn } from "@/lib/cn";

type ScaleSelectorProps = {
  name: string;
  label: string;
  value: number | null;
  lowLabel: string;
  highLabel: string;
  onChange: (value: number) => void;
};

export function ScaleSelector({
  name,
  label,
  value,
  lowLabel,
  highLabel,
  onChange,
}: ScaleSelectorProps) {
  return (
    <fieldset>
      <legend className="sr-only">
        {label} scale, from 1 {lowLabel} to 5 {highLabel}
      </legend>
      <div className="flex items-center justify-between gap-3 text-sm text-muted">
        <span>{lowLabel}</span>
        <span className="font-medium text-ink">{label}</span>
        <span className="text-right">{highLabel}</span>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((score) => {
          const id = `${name}-scale-${score}`;
          const checked = value === score;

          return (
            <label
              key={score}
              htmlFor={id}
              className={cn(
                "flex min-h-12 cursor-pointer flex-col items-center justify-center rounded-2xl border",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-moss",
                checked
                  ? "border-moss bg-paper font-medium"
                  : "border-line bg-cream/80 hover:border-moss/50",
              )}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={score}
                checked={checked}
                onChange={() => onChange(score)}
                className="sr-only"
              />
              <span className="text-lg tabular-nums">{score}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
