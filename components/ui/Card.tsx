import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article" | "aside";
  children: ReactNode;
  padded?: boolean;
};

export function Card({
  as: Component = "div",
  children,
  className,
  padded = true,
  ...rest
}: CardProps) {
  const Tag = Component as ElementType;

  return (
    <Tag
      className={cn(
        "rounded-3xl border border-line bg-cream shadow-[0_1px_0_rgba(23,36,28,0.04)]",
        padded && "p-6 sm:p-8",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
