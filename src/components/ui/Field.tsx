import type {
  ReactNode,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import clsx from "clsx";
import { AlertCircle } from "lucide-react";

export function Field({
  label,
  htmlFor,
  required,
  optional,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-baseline justify-between gap-3 text-sm font-semibold text-pine-900"
      >
        <span>
          {label}
          {required && (
            <span className="text-marigold-600" aria-hidden>
              {" "}
              *
            </span>
          )}
        </span>
        {optional && (
          <span className="text-xs font-normal text-muted">Optional</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${htmlFor}-hint`} className="text-[13px] leading-snug text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="flex items-start gap-1.5 text-[13px] font-medium leading-snug text-red-700"
        >
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

export const inputBase =
  "w-full rounded-[10px] border bg-white px-3.5 text-[15px] text-ink placeholder:text-pine-300 transition-shadow focus:outline-none focus:ring-4 disabled:bg-pine-50 disabled:text-pine-300";

const okBorder = "border-pine-200 hover:border-pine-300 focus:border-pine-500 focus:ring-pine-500/15";
const badBorder = "border-red-400 focus:border-red-500 focus:ring-red-500/15";

type Invalid = { invalid?: boolean };

export function Input({
  invalid,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & Invalid) {
  return (
    <input
      aria-invalid={invalid || undefined}
      {...props}
      className={clsx(inputBase, "h-11", invalid ? badBorder : okBorder, className)}
    />
  );
}

export function Textarea({
  invalid,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & Invalid) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      {...props}
      className={clsx(
        inputBase,
        "resize-y py-2.5 leading-relaxed",
        invalid ? badBorder : okBorder,
        className
      )}
    />
  );
}

export function Select({
  invalid,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & Invalid) {
  return (
    <select
      aria-invalid={invalid || undefined}
      {...props}
      className={clsx(
        inputBase,
        "h-11 cursor-pointer appearance-none bg-[length:16px] bg-[right_0.85rem_center] bg-no-repeat pr-10",
        invalid ? badBorder : okBorder,
        className
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2351645D' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        ...props.style,
      }}
    />
  );
}
