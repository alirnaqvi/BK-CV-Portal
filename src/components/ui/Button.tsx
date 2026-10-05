import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-pine-800 text-white hover:bg-pine-700 active:bg-pine-900 disabled:bg-pine-200 disabled:text-white",
  accent:
    "bg-marigold-400 text-pine-900 hover:bg-marigold-300 active:bg-marigold-500 disabled:opacity-60",
  secondary:
    "border border-pine-200 bg-white text-pine-800 hover:border-pine-400 hover:bg-pine-50 disabled:opacity-50",
  ghost: "text-pine-700 hover:bg-pine-100/70 disabled:opacity-50",
  danger:
    "bg-red-700 text-white hover:bg-red-800 active:bg-red-900 disabled:opacity-60",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 gap-1.5 px-3.5 text-sm",
  md: "h-11 gap-2 px-5 text-[15px]",
  lg: "h-[52px] gap-2.5 px-7 text-base",
};

/** Class string for links that should look like buttons. */
export function buttonClasses(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string
) {
  return clsx(
    "inline-flex select-none items-center justify-center whitespace-nowrap rounded-full font-semibold transition-colors disabled:cursor-not-allowed",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses(variant, size, className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
