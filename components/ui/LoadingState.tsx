import { cn } from "@/lib/cn";

type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({
  label = "Loading",
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-3xl border border-line bg-cream px-6 py-10 text-center",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="size-8 animate-pulse rounded-full bg-line motion-reduce:animate-none"
      />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
