import clsx from "clsx";
import { Briefcase, GraduationCap, MapPin, Paperclip, User } from "lucide-react";
import { formatFileSize, formatYears, initials, splitSkills } from "@/lib/format";

export interface RegistryCardData {
  fullName?: string;
  domain?: string;
  currentRole?: string;
  currentCompany?: string;
  city?: string;
  experienceYears?: number | null;
  education?: string;
  skills?: string;
  fileName?: string;
  fileSize?: number | null;
  /** Replaces the computed "N years of experience" line (used by the sample card). */
  experienceText?: string;
}

/**
 * The index card a candidate becomes in the registry. Used as the hero
 * illustration, as the live preview next to the form, and on the confirmation
 * page. Empty fields render as quiet placeholders so the card always has shape.
 */
export function RegistryCard({
  data,
  stamped = false,
  animateStamp = false,
  sample = false,
  className,
}: {
  data: RegistryCardData;
  stamped?: boolean;
  animateStamp?: boolean;
  /** An illustrative card with stand-in text: shows a person icon, not initials. */
  sample?: boolean;
  className?: string;
}) {
  const skills = splitSkills(data.skills);
  const shownSkills = skills.slice(0, 4);
  const extraSkills = skills.length - shownSkills.length;
  const role = [data.currentRole, data.currentCompany].filter(Boolean).join(" at ");
  const years = formatYears(data.experienceYears);
  const experience = data.experienceText || (years && `${years} of experience`);
  const mark = sample ? "" : initials(data.fullName ?? "");

  return (
    <div className={clsx("relative pt-7", className)}>
      {/* Folder tab carrying the field */}
      <div
        className={clsx(
          "absolute left-5 top-0 flex h-8 max-w-[75%] items-center rounded-t-[10px] px-3.5 text-[13px] font-semibold",
          data.domain
            ? "bg-marigold-400 text-pine-900"
            : "bg-pine-100 text-pine-400"
        )}
      >
        <span className="truncate">{data.domain || "Your field"}</span>
      </div>

      <div className="relative overflow-hidden rounded-2xl rounded-tl-md border border-line bg-white shadow-card">
        <div className="flex items-center gap-3.5 px-5 pb-4 pt-5">
          <div
            className={clsx(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-base font-bold",
              mark || sample
                ? "bg-pine-800 text-marigold-300"
                : "border border-dashed border-pine-200 bg-pine-50 text-pine-300"
            )}
            aria-hidden
          >
            {mark || <User className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <p
              className={clsx(
                "truncate font-display text-xl font-bold leading-tight tracking-tight",
                data.fullName ? "text-pine-900" : "text-pine-300"
              )}
            >
              {data.fullName || "Your name"}
            </p>
            <p
              className={clsx(
                "mt-0.5 truncate text-sm",
                role ? "text-muted" : "text-pine-300"
              )}
            >
              {role || "Your current role"}
            </p>
          </div>
        </div>

        <div className="ruled space-y-0 px-5 pb-2 text-sm">
          <Line icon={MapPin} value={data.city} placeholder="City" />
          <Line icon={Briefcase} value={experience} placeholder="Experience" />
          <Line icon={GraduationCap} value={data.education} placeholder="Education" />
        </div>

        <div className="flex min-h-[44px] flex-wrap items-center gap-1.5 px-5 py-2.5">
          {shownSkills.length === 0 ? (
            <>
              <span className="h-6 w-16 rounded-full bg-pine-50" />
              <span className="h-6 w-20 rounded-full bg-pine-50" />
              <span className="h-6 w-12 rounded-full bg-pine-50" />
            </>
          ) : (
            <>
              {shownSkills.map((s) => (
                <span
                  key={s}
                  className="max-w-[10rem] truncate rounded-full bg-pine-50 px-2.5 py-1 text-xs font-medium text-pine-700"
                >
                  {s}
                </span>
              ))}
              {extraSkills > 0 && (
                <span className="text-xs text-muted">+{extraSkills} more</span>
              )}
            </>
          )}
        </div>

        <div
          className={clsx(
            "flex items-center gap-2 border-t border-dashed border-line px-5 py-3 text-sm",
            data.fileName ? "text-pine-800" : "text-pine-300"
          )}
        >
          <Paperclip className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate font-medium">
            {data.fileName || "CV not attached yet"}
          </span>
          {data.fileName && data.fileSize ? (
            <span className="ml-auto shrink-0 text-xs text-muted">
              {formatFileSize(data.fileSize)}
            </span>
          ) : null}
        </div>

        {stamped && (
          <div
            className={clsx(
              "pointer-events-none absolute right-4 top-[88px] -rotate-[11deg] rounded-lg border-[3px] border-marigold-500 bg-white/70 px-2.5 py-1 font-display text-base font-extrabold uppercase tracking-[0.14em] text-marigold-600",
              animateStamp && "animate-stamp"
            )}
            aria-hidden
          >
            On file
          </div>
        )}
      </div>
    </div>
  );
}

function Line({
  icon: Icon,
  value,
  placeholder,
}: {
  icon: typeof MapPin;
  value?: string | null | false;
  placeholder: string;
}) {
  return (
    <div
      className={clsx(
        "flex h-7 items-center gap-2",
        value ? "text-pine-800" : "text-pine-300"
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="truncate">{value || placeholder}</span>
    </div>
  );
}
