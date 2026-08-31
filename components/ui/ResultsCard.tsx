import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type ResultsCardProps = {
  rank?: number;
  title: string;
  explanation?: string;
  children?: ReactNode;
  className?: string;
};

export function ResultsCard({
  rank,
  title,
  explanation,
  children,
  className,
}: ResultsCardProps) {
  const headingId = `result-${rank ?? title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <Card as="article" className={cn("space-y-4", className)} aria-labelledby={headingId}>
      {typeof rank === "number" ? (
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-copper">
          Match {rank}
        </p>
      ) : null}
      <h3 id={headingId} className="font-display text-2xl tracking-tight">
        {title}
      </h3>
      {explanation ? (
        <p className="leading-relaxed text-muted">{explanation}</p>
      ) : null}
      {children}
    </Card>
  );
}
