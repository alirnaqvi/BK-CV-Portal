"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  const arrow =
    "flex h-9 w-9 items-center justify-center rounded-full border border-pine-200 bg-white text-pine-800 hover:border-pine-400 hover:bg-pine-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-pine-200 disabled:hover:bg-white";

  return (
    <nav
      className="flex flex-col items-center justify-between gap-3 px-1 py-4 text-sm text-muted sm:flex-row"
      aria-label="Pages"
    >
      <span>
        Showing {start} to {end} of {total}
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className={arrow}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <span className="px-1 font-medium text-pine-900">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className={arrow}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </nav>
  );
}
