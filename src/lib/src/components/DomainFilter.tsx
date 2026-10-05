"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Layers } from "lucide-react";
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
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function toggle(domain: string) {
    if (selected.includes(domain)) {
      onChange(selected.filter((d) => d !== domain));
    } else {
      onChange([...selected, domain]);
    }
  }

  const label =
    selected.length === 0
      ? "All fields"
      : selected.length === 1
      ? selected[0]
      : `${selected.length} fields`;

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className={clsx(
          "flex h-11 w-full items-center gap-2 rounded-[10px] border bg-white px-3.5 text-[15px] transition-shadow sm:w-56",
          open
            ? "border-pine-500 ring-4 ring-pine-500/15"
            : "border-pine-200 hover:border-pine-300",
          selected.length > 0 ? "font-semibold text-pine-900" : "text-ink"
        )}
      >
        <Layers className="h-4 w-4 shrink-0 text-muted" aria-hidden />
        <span className="flex-1 truncate text-left">{label}</span>
        <ChevronDown
          className={clsx(
            "h-4 w-4 shrink-0 text-muted transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-2 animate-pop-in rounded-xl border border-line bg-white p-1.5 shadow-lift sm:right-auto sm:w-72">
          {options.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted">
              Fields appear here once the first CV arrives.
            </p>
          ) : (
            <>
              <ul className="max-h-72 overflow-y-auto">
                {options.map((domain) => (
                  <li key={domain}>
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[15px] text-ink hover:bg-pine-50">
                      <input
                        type="checkbox"
                        checked={selected.includes(domain)}
                        onChange={() => toggle(domain)}
                        className="checkbox"
                      />
                      <span className="truncate">{domain}</span>
                    </label>
                  </li>
                ))}
              </ul>
              {selected.length > 0 && (
                <div className="mt-1 border-t border-line pt-1">
                  <button
                    type="button"
                    onClick={() => onChange([])}
                    className="w-full rounded-lg px-2.5 py-2 text-left text-sm font-semibold text-pine-700 hover:bg-pine-50"
                  >
                    Show all fields
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
