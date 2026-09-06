import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ink-700 text-paper hover:bg-ink-800 disabled:bg-ink-300 disabled:cursor-not-allowed",
  secondary:
    "bg-transparent text-ink-700 border border-ink-200 hover:border-ink-400 hover:bg-ink-50 disabled:opacity-50 disabled:cursor-not-allowed",
  ghost:
    "bg-transparent text-ink-600 hover:bg-ink-50 disabled:opacity-50 disabled:cursor-not-allowed",
  danger:
    "bg-transparent text-red-700 border border-red-200 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed",
};

const sizeClasses = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center rounded-sm font-medium transition-colors",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
