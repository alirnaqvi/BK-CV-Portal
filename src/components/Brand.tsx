import Link from "next/link";
import clsx from "clsx";
import { SITE } from "@/lib/site";

/** The folder-tab mark and wordmark. `tone` picks colours for light or dark backgrounds. */
export function Brand({
  href = "/",
  tone = "light",
  suffix,
  compact = false,
}: {
  href?: string;
  tone?: "light" | "dark";
  suffix?: string;
  /** Drop "Talent Registry" on phones, where the header has less room. */
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 rounded-lg"
      aria-label={`${SITE.name} home`}
    >
      <BrandMark />
      <span
        className={clsx(
          "whitespace-nowrap font-display text-[17px] font-bold leading-none tracking-tight",
          tone === "dark" ? "text-white" : "text-pine-900"
        )}
      >
        {SITE.shortName}{" "}
        <span
          className={clsx(
            "font-medium",
            compact ? "hidden sm:inline" : "max-[359px]:hidden",
            tone === "dark" ? "text-pine-200" : "text-muted"
          )}
        >
          Talent Registry
        </span>
        {suffix && (
          <span
            className={clsx(
              "ml-2 rounded-full px-2 py-0.5 align-middle font-sans text-[11px] font-semibold",
              tone === "dark"
                ? "bg-white/10 text-pine-100"
                : "bg-pine-100 text-pine-700"
            )}
          >
            {suffix}
          </span>
        )}
      </span>
    </Link>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      className={clsx("h-8 w-8 shrink-0", className)}
    >
      <rect width="64" height="64" rx="14" fill="#0B362D" />
      <path
        d="M14 22a4 4 0 0 1 4-4h12l4 5h12a4 4 0 0 1 4 4v17a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4z"
        fill="#FFB526"
      />
      <path
        d="M22 33h20M22 40h13"
        stroke="#0B362D"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
