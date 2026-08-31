import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type QuestionContainerProps = {
  step: number;
  total: number;
  title: string;
  description?: string | null;
  children: ReactNode;
  className?: string;
};

export function QuestionContainer({
  step,
  total,
  title,
  description,
  children,
  className,
}: QuestionContainerProps) {
  const headingId = `question-${step}-title`;

  return (
    <Card as="section" className={cn("space-y-4", className)} aria-labelledby={headingId}>
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-moss">
        Question {step} of {total}
      </p>
      <h2 id={headingId} className="font-display text-2xl tracking-tight sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="leading-relaxed text-muted">{description}</p>
      ) : null}
      <div className="pt-2">{children}</div>
    </Card>
  );
}
