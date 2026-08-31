import { clampProgress, progressLabel } from "@/lib/ui/progress";
import { cn } from "@/lib/cn";

type ProgressIndicatorProps = {
  value: number;
  max: number;
  label?: string;
  className?: string;
};

export function ProgressIndicator({
  value,
  max,
  label,
  className,
}: ProgressIndicatorProps) {
  const progress = clampProgress(value, max);
  const accessibleLabel = label ?? progressLabel(progress.value, progress.max);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-baseline justify-between gap-3 text-sm text-muted">
        <p>{accessibleLabel}</p>
        <p className="tabular-nums text-ink">
          {progress.value} / {progress.max}
        </p>
      </div>
      <div
        role="progressbar"
        aria-label={accessibleLabel}
        aria-valuemin={0}
        aria-valuemax={progress.max}
        aria-valuenow={progress.value}
        className="mt-2 h-2 overflow-hidden rounded-full bg-line"
      >
        <div
          className="h-full rounded-full bg-moss transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </div>
  );
}
