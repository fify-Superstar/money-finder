"use client";

import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";

type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className"
> & {
  label: string;
  error?: string | null;
  hideLabel?: boolean;
};

export function TextField({
  id,
  label,
  error,
  hideLabel = false,
  ...rest
}: TextFieldProps) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className={
          hideLabel ? "sr-only" : "text-sm font-medium text-ink"
        }
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "min-h-12 w-full rounded-2xl border bg-cream px-4 text-base text-ink",
          "outline-none focus-visible:border-moss focus-visible:ring-2 focus-visible:ring-moss/30",
          error ? "border-danger" : "border-line",
        )}
        {...rest}
      />
      {error ? (
        <p id={describedBy} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
