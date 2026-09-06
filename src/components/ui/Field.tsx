import type {
  ReactNode,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import clsx from "clsx";

export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-700">
        {label}
        {required && <span className="text-brass-600"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink-400">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

const inputBase =
  "w-full rounded-sm border border-ink-200 px-3 py-2 text-sm text-slate-ink placeholder:text-ink-300 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-300 disabled:bg-ink-50 disabled:text-ink-300";

// Background is not baked into inputBase so callers can override it (e.g. the
// admin login screen sits on a dark card and needs a dark input).
const defaultBg = "bg-white";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const hasBgOverride = /(^|\s)bg-/.test(props.className ?? "");
  return (
    <input
      {...props}
      className={clsx(inputBase, !hasBgOverride && defaultBg, props.className)}
    />
  );
}

export function Textarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  const hasBgOverride = /(^|\s)bg-/.test(props.className ?? "");
  return (
    <textarea
      {...props}
      className={clsx(inputBase, "resize-y", !hasBgOverride && defaultBg, props.className)}
    />
  );
}

export function Select(
  props: SelectHTMLAttributes<HTMLSelectElement>
) {
  const hasBgOverride = /(^|\s)bg-/.test(props.className ?? "");
  return (
    <select
      {...props}
      className={clsx(inputBase, !hasBgOverride && defaultBg, props.className)}
    />
  );
}
