"use client";

import { cn } from "@/lib/cn";
import type { TextareaHTMLAttributes } from "react";

type TextAreaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className"
> & {
  label: string;
  hideLabel?: boolean;
};

export function TextArea({
  id,
  label,
  hideLabel = false,
  ...rest
}: TextAreaProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className={hideLabel ? "sr-only" : "text-sm font-medium text-ink"}
      >
        {label}
      </label>
      <textarea
        id={id}
        className={cn(
          "min-h-32 w-full rounded-2xl border border-line bg-cream px-4 py-3 text-base text-ink",
          "outline-none focus-visible:border-moss focus-visible:ring-2 focus-visible:ring-moss/30",
        )}
        {...rest}
      />
    </div>
  );
}
