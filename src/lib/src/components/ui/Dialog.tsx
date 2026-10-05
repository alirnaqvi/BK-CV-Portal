"use client";

import { ReactNode, useEffect, useRef } from "react";
import { X } from "lucide-react";

/** Modal shell: backdrop, Escape and outside-click to close, focus returned on close. */
export function Dialog({
  titleId,
  title,
  onClose,
  locked = false,
  children,
}: {
  titleId: string;
  title: string;
  onClose: () => void;
  /** While true (for example during a save), the dialog can't be dismissed. */
  locked?: boolean;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !locked) onClose();
      if (e.key !== "Tab" || !panelRef.current) return;
      // Keep Tab inside the dialog.
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [locked, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-pine-900/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !locked) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md animate-rise-in rounded-t-2xl bg-white p-6 shadow-lift sm:rounded-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id={titleId}
            className="font-display text-2xl font-bold tracking-tight text-pine-900"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={locked}
            aria-label="Close"
            className="-mr-2 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-pine-50 hover:text-pine-900 disabled:opacity-40"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
