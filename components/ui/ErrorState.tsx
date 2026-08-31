import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ErrorStateProps = {
  title?: string;
  message: string;
  action?: ReactNode;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  message,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-3xl border border-danger/30 bg-cream px-6 py-8",
        className,
      )}
    >
      <h2 className="font-display text-xl tracking-tight text-danger">{title}</h2>
      <p className="mt-2 leading-relaxed text-muted">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
