import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary:
    "bg-moss text-cream hover:bg-moss-dark focus-visible:outline-moss",
  secondary:
    "border border-line bg-cream text-ink hover:border-moss hover:text-moss focus-visible:outline-moss",
  ghost: "text-ink hover:text-moss focus-visible:outline-moss",
} as const;

const sizes = {
  sm: "min-h-11 px-4 py-2 text-sm",
  md: "min-h-11 px-6 py-3 text-base",
  lg: "min-h-12 px-7 py-3.5 text-base",
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

type SharedProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  fullWidth?: boolean;
};

type ButtonButtonProps = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    href?: undefined;
  };

type ButtonLinkProps = SharedProps & {
  href: string;
  disabled?: boolean;
};

export type ButtonProps = ButtonButtonProps | ButtonLinkProps;

function buttonClassName({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: Pick<SharedProps, "variant" | "size" | "fullWidth" | "className">) {
  return cn(
    "inline-flex items-center justify-center rounded-full font-medium transition",
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  );
}

export function Button(props: ButtonProps) {
  const className = buttonClassName(props);

  if (props.href) {
    const { href, children, disabled } = props;

    if (disabled) {
      return (
        <span className={className} aria-disabled="true">
          {children}
        </span>
      );
    }

    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonButtonProps;
  const {
    children,
    type = "button",
    variant: _variant,
    size: _size,
    fullWidth: _fullWidth,
    className: _ignoredClassName,
    ...rest
  } = buttonProps;

  return (
    <button type={type} className={className} {...rest}>
      {children}
    </button>
  );
}
