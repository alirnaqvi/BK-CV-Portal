"use client";

import { FileText, Trash2 } from "lucide-react";
import type { CVItem } from "@/types/cv";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CVTable({
  items,
  selected,
  onToggle,
  onToggleAll,
  onDelete,
  loading,
}: {
  items: CVItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onDelete: (item: CVItem) => void;
  loading: boolean;
}) {
  const allChecked = items.length > 0 && items.every((i) => selected.has(i.id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-ledger text-xs text-ink-400">
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={onToggleAll}
                aria-label="Select all on this page"
                className="h-4 w-4 rounded-sm border-ink-300 text-brass-600 focus:ring-brass-300"
              />
            </th>
            <th className="px-3 py-3 font-medium">Candidate</th>
            <th className="px-3 py-3 font-medium">Domain</th>
            <th className="px-3 py-3 font-medium">Experience</th>
            <th className="px-3 py-3 font-medium">Current role</th>
            <th className="px-3 py-3 font-medium">City</th>
            <th className="px-3 py-3 font-medium">Submitted</th>
            <th className="px-3 py-3 font-medium">CV</th>
            <th className="w-10 px-3 py-3" />
          </tr>
        </thead>
        <tbody>
          {!loading && items.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-12 text-center text-ink-400">
                No CVs match the current filters.
              </td>
            </tr>
          )}
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-ledger last:border-0 hover:bg-ink-50/60"
            >
              <td className="px-4 py-3 align-top">
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => onToggle(item.id)}
                  aria-label={`Select ${item.fullName}`}
                  className="h-4 w-4 rounded-sm border-ink-300 text-brass-600 focus:ring-brass-300"
                />
              </td>
              <td className="px-3 py-3 align-top">
                <div className="font-medium text-ink-800">{item.fullName}</div>
                <div className="text-xs text-ink-400">{item.email}</div>
                {item.phone && (
                  <div className="text-xs text-ink-400">{item.phone}</div>
                )}
              </td>
              <td className="px-3 py-3 align-top">
                <span className="inline-block rounded-sm bg-brass-50 px-2 py-0.5 text-xs text-brass-700">
                  {item.domain}
                </span>
              </td>
              <td className="px-3 py-3 align-top text-ink-600">
                {item.experienceYears !== null ? `${item.experienceYears} yrs` : "—"}
              </td>
              <td className="px-3 py-3 align-top">
                <div className="text-ink-700">{item.currentRole || "—"}</div>
                {item.currentCompany && (
                  <div className="text-xs text-ink-400">{item.currentCompany}</div>
                )}
              </td>
              <td className="px-3 py-3 align-top text-ink-600">{item.city || "—"}</td>
              <td className="px-3 py-3 align-top text-ink-500">
                {formatDate(item.createdAt)}
              </td>
              <td className="px-3 py-3 align-top">
                <a
                  href={`/api/cvs/${item.id}/file`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-brass-700 hover:underline"
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden />
                  View
                </a>
              </td>
              <td className="px-3 py-3 align-top">
                <button
                  type="button"
                  onClick={() => onDelete(item)}
                  aria-label={`Delete ${item.fullName}`}
                  className="text-ink-300 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
