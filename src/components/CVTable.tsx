"use client";

import { ReactNode, useState } from "react";
import clsx from "clsx";
import { ChevronDown, FileText, Mail, Phone, Trash2 } from "lucide-react";
import type { CVItem } from "@/types/cv";
import {
  formatDate,
  formatFileSize,
  formatRelativeDate,
  formatYears,
  initials,
  splitSkills,
} from "@/lib/format";

const AVATAR_TONES = [
  "bg-pine-800 text-marigold-300",
  "bg-marigold-200 text-pine-900",
  "bg-pine-100 text-pine-800",
  "bg-pine-600 text-white",
];

function avatarTone(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

function Avatar({ name }: { name: string }) {
  return (
    <span
      className={clsx(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold",
        avatarTone(name)
      )}
      aria-hidden
    >
      {initials(name) || "?"}
    </span>
  );
}

function FieldPill({ children }: { children: string }) {
  return (
    <span className="inline-block max-w-[14rem] truncate rounded-full bg-marigold-100 px-2.5 py-1 align-middle text-xs font-semibold text-marigold-700">
      {children}
    </span>
  );
}

function Received({ iso }: { iso: string }) {
  const label = formatRelativeDate(iso);
  const isNew = label === "Today";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 whitespace-nowrap",
        isNew ? "font-semibold text-pine-800" : "text-muted"
      )}
      title={formatDate(iso)}
    >
      {isNew && <span className="h-2 w-2 rounded-full bg-marigold-400" aria-hidden />}
      {label}
    </span>
  );
}

function openCvHref(item: CVItem) {
  return `/api/cvs/${item.id}/file`;
}

/** Everything the list row doesn't have room for. */
function Details({ item }: { item: CVItem }) {
  const skills = splitSkills(item.skills);
  return (
    <dl className="grid gap-x-8 gap-y-4 text-sm xl:grid-cols-[1.1fr_1fr_1.4fr]">
      <div>
        <dt className="font-semibold text-pine-900">Contact</dt>
        <dd className="mt-1.5 space-y-1.5">
          <a
            href={`mailto:${item.email}`}
            className="flex items-center gap-2 break-all text-pine-700 hover:underline"
          >
            <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {item.email}
          </a>
          {item.phone ? (
            <a
              href={`tel:${item.phone.replace(/[^\d+]/g, "")}`}
              className="flex items-center gap-2 text-pine-700 hover:underline"
            >
              <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {item.phone}
            </a>
          ) : (
            <p className="flex items-center gap-2 text-muted">
              <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
              No phone given
            </p>
          )}
        </dd>
      </div>
      <div>
        <dt className="font-semibold text-pine-900">Education</dt>
        <dd className={clsx("mt-1.5", item.education ? "text-ink" : "text-muted")}>
          {item.education || "Not given"}
        </dd>
        <dt className="mt-4 font-semibold text-pine-900">CV file</dt>
        <dd className="mt-1.5 break-all text-ink">
          {item.fileName}
          {item.fileSize ? (
            <span className="text-muted"> ({formatFileSize(item.fileSize)})</span>
          ) : null}
        </dd>
      </div>
      <div>
        <dt className="font-semibold text-pine-900">Skills</dt>
        <dd className="mt-2">
          {skills.length === 0 ? (
            <span className="text-muted">Not given</span>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {skills.map((s, i) => (
                <li
                  key={`${s}-${i}`}
                  className="rounded-full border border-pine-200 bg-white px-2.5 py-1 text-xs font-medium text-pine-800"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </dd>
      </div>
    </dl>
  );
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
  const [expanded, setExpanded] = useState<string | null>(null);
  const selectedOnPage = items.filter((i) => selected.has(i.id)).length;
  const allChecked = items.length > 0 && selectedOnPage === items.length;
  const someChecked = selectedOnPage > 0 && !allChecked;

  const toggleExpanded = (id: string) =>
    setExpanded((current) => (current === id ? null : id));

  const openCv =
    "inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border border-pine-200 bg-white px-3.5 text-sm font-semibold text-pine-800 hover:border-pine-400 hover:bg-pine-50";
  const iconButton =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors";

  return (
    <div
      className={clsx("transition-opacity", loading && "opacity-60")}
      aria-busy={loading}
    >
      {/* Wide screens: table */}
      <div className="hidden overflow-hidden rounded-xl border border-line bg-white xl:block">
        <table className="w-full table-fixed text-left text-sm">
          <colgroup>
            <col className="w-12" />
            <col />
            <col className="w-[15%]" />
            <col className="w-[16%]" />
            <col className="w-[8%]" />
            <col className="w-[9%]" />
            <col className="w-[10%]" />
            <col className="w-[190px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-line bg-pine-50/70 text-[13px] text-muted">
              <th scope="col" className="py-3 pl-4">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => {
                    if (el) el.indeterminate = someChecked;
                  }}
                  onChange={onToggleAll}
                  aria-label="Select everyone on this page"
                  className="checkbox block"
                />
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">Candidate</th>
              <th scope="col" className="px-3 py-3 font-semibold">Field</th>
              <th scope="col" className="px-3 py-3 font-semibold">Current role</th>
              <th scope="col" className="px-3 py-3 font-semibold">Experience</th>
              <th scope="col" className="px-3 py-3 font-semibold">City</th>
              <th scope="col" className="px-3 py-3 font-semibold">Received</th>
              <th scope="col" className="px-3 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isOpen = expanded === item.id;
              const isSelected = selected.has(item.id);
              return (
                <RowGroup key={item.id}>
                  <tr
                    className={clsx(
                      "border-b border-line transition-colors",
                      isSelected ? "bg-marigold-50" : isOpen ? "bg-pine-50/60" : "hover:bg-pine-50/60",
                      isOpen && "border-b-0"
                    )}
                  >
                    <td className="py-3 pl-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggle(item.id)}
                        aria-label={`Select ${item.fullName}`}
                        className="checkbox block"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={item.fullName} />
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => toggleExpanded(item.id)}
                            aria-expanded={isOpen}
                            className="block max-w-full truncate rounded text-left font-semibold text-pine-900 hover:underline"
                          >
                            {item.fullName}
                          </button>
                          <p className="truncate text-[13px] text-muted">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <FieldPill>{item.domain}</FieldPill>
                    </td>
                    <td className="px-3 py-3">
                      {item.currentRole ? (
                        <>
                          <p className="truncate text-ink">{item.currentRole}</p>
                          {item.currentCompany && (
                            <p className="truncate text-[13px] text-muted">
                              {item.currentCompany}
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-pine-300">Not given</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-ink">
                      {item.experienceYears !== null ? (
                        formatYears(item.experienceYears)
                      ) : (
                        <span className="text-pine-300">Not given</span>
                      )}
                    </td>
                    <td className="truncate px-3 py-3 text-ink">
                      {item.city || <span className="text-pine-300">Not given</span>}
                    </td>
                    <td className="px-3 py-3">
                      <Received iso={item.createdAt} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={openCvHref(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={openCv}
                        >
                          <FileText className="h-4 w-4" aria-hidden />
                          Open CV
                        </a>
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          aria-label={`Delete ${item.fullName}`}
                          className={clsx(iconButton, "hover:bg-red-50 hover:text-red-700")}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(item.id)}
                          aria-expanded={isOpen}
                          aria-label={`${isOpen ? "Hide" : "Show"} details for ${item.fullName}`}
                          className={clsx(iconButton, "hover:bg-pine-100 hover:text-pine-900")}
                        >
                          <ChevronDown
                            className={clsx("h-4 w-4 transition-transform", isOpen && "rotate-180")}
                            aria-hidden
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className={clsx("border-b border-line", isSelected ? "bg-marigold-50" : "bg-pine-50/60")}>
                      <td />
                      <td colSpan={7} className="px-3 pb-5 pt-1">
                        <Details item={item} />
                      </td>
                    </tr>
                  )}
                </RowGroup>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Narrow screens: one card per candidate */}
      <div className="xl:hidden">
        <label className="mb-3 flex w-fit cursor-pointer items-center gap-2.5 text-sm font-medium text-pine-900">
          <input
            type="checkbox"
            checked={allChecked}
            ref={(el) => {
              if (el) el.indeterminate = someChecked;
            }}
            onChange={onToggleAll}
            className="checkbox"
          />
          Select everyone on this page
        </label>
        <ul className="grid grid-cols-1 items-start gap-3 md:grid-cols-2">
          {items.map((item) => {
            const isOpen = expanded === item.id;
            const isSelected = selected.has(item.id);
            const meta = [item.city, formatYears(item.experienceYears)].filter(Boolean);
            return (
              <li
                key={item.id}
                className={clsx(
                  "min-w-0 rounded-xl border p-4",
                  isSelected ? "border-marigold-300 bg-marigold-50" : "border-line bg-white"
                )}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(item.id)}
                    aria-label={`Select ${item.fullName}`}
                    className="checkbox mt-3"
                  />
                  <Avatar name={item.fullName} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-pine-900">{item.fullName}</p>
                    <p className="truncate text-sm text-muted">
                      {[item.currentRole, item.currentCompany].filter(Boolean).join(" at ") ||
                        item.email}
                    </p>
                  </div>
                  <span className="shrink-0 pt-0.5 text-[13px]">
                    <Received iso={item.createdAt} />
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted">
                  <FieldPill>{item.domain}</FieldPill>
                  {meta.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>

                {isOpen && (
                  <div className="mt-4 border-t border-line pt-4">
                    <Details item={item} />
                  </div>
                )}

                <div className="mt-4 flex items-center gap-1">
                  <a
                    href={openCvHref(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={openCv}
                  >
                    <FileText className="h-4 w-4" aria-hidden />
                    Open CV
                  </a>
                  <button
                    type="button"
                    onClick={() => toggleExpanded(item.id)}
                    aria-expanded={isOpen}
                    className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-sm font-semibold text-pine-700 hover:bg-pine-100/70"
                  >
                    {isOpen ? "Hide details" : "Details"}
                    <ChevronDown
                      className={clsx("h-4 w-4 transition-transform", isOpen && "rotate-180")}
                      aria-hidden
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    aria-label={`Delete ${item.fullName}`}
                    className={clsx(iconButton, "ml-auto hover:bg-red-50 hover:text-red-700")}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// A fragment that can carry a key for the row + details-row pair.
function RowGroup({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
