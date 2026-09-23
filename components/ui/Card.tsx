import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article" | "aside";
  children: ReactNode;
  padded?: boolean;
  elevated?: boolean;
};

export function Card({
  as: Component = "div",
  children,
  className,
  padded = true,
  elevated = false,
  ...rest
}: CardProps) {
  const Tag = Component as ElementType;

  return (
    <Tag
      className={cn(
        "border border-line bg-cream",
        elevated
          ? [
              "rounded-[1.75rem]",
              "shadow-[0_20px_50px_rgba(23,36,28,0.06)]",
              "transition-[transform,box-shadow] duration-300 ease-out",
              "motion-safe:hover:-translate-y-1",
              "hover:shadow-[0_28px_64px_rgba(23,36,28,0.1)]",
            ].join(" ")
          : "rounded-3xl shadow-[0_1px_0_rgba(23,36,28,0.04)]",
        padded && "p-6 sm:p-8",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
