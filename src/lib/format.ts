export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase();
}

export function formatFileSize(bytes: number | null | undefined) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function splitSkills(skills: string | null | undefined) {
  if (!skills) return [];
  return skills
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function formatYears(years: number | null | undefined) {
  if (years === null || years === undefined) return "";
  if (years === 0) return "Under 1 year";
  return years === 1 ? "1 year" : `${years} years`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** "Today", "Yesterday", "3 days ago", then a short date ("23 Sep", with the year if it differs). */
export function formatRelativeDate(iso: string) {
  const then = new Date(iso);
  const now = new Date();
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(then)) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return then.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(then.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
}
