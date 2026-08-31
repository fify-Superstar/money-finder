import { EmptyState } from "@/components/ui/EmptyState";

type ScoreDisplayProps = {
  label: string;
  score: number | null;
  max?: number;
};

export function ScoreDisplay({
  label,
  score,
  max = 100,
}: ScoreDisplayProps) {
  if (score === null) {
    return (
      <EmptyState
        title="No match score yet"
        description="A match score will appear here once your Money Map is ready."
      />
    );
  }

  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-4xl tracking-tight tabular-nums">
        {score}
        <span className="text-lg text-muted"> / {max}</span>
      </p>
    </div>
  );
}
