"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import clsx from "clsx";

export function DomainFilter({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle(domain: string) {
    if (selected.includes(domain)) {
      onChange(selected.filter((d) => d !== domain));
    } else {
      onChange([...selected, domain]);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "flex min-w-[200px] items-center justify-between gap-2 rounded-sm border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 hover:border-ink-300",
          open && "border-brass-400 ring-1 ring-brass-300"
        )}
      >
        <span className="truncate">
          {selected.length === 0
            ? "All fields / domains"
            : selected.length === 1
            ? selected[0]
            : `${selected.length} domains selected`}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 max-h-72 w-72 overflow-y-auto rounded-sm border border-ink-200 bg-white p-2 shadow-card">
          {options.length === 0 && (
            <p className="px-2 py-3 text-sm text-ink-400">No CVs yet.</p>
          )}
          {options.map((domain) => (
            <label
              key={domain}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-ink-700 hover:bg-ink-50"
            >
              <input
                type="checkbox"
                checked={selected.includes(domain)}
                onChange={() => toggle(domain)}
                className="h-4 w-4 rounded-sm border-ink-300 text-brass-600 focus:ring-brass-300"
              />
              {domain}
            </label>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="mt-1 flex items-center gap-1 text-xs text-ink-400 hover:text-ink-600"
        >
          <X className="h-3 w-3" aria-hidden />
          Clear filter
        </button>
      )}
    </div>
  );
}
