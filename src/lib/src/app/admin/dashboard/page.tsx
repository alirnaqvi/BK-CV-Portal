"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  ExternalLink,
  FileArchive,
  Inbox,
  KeyRound,
  Link2,
  Loader2,
  LogOut,
  Search,
  SearchX,
  X,
} from "lucide-react";
import { Brand } from "@/components/Brand";
import { DomainFilter } from "@/components/DomainFilter";
import { CVTable } from "@/components/CVTable";
import { Pagination } from "@/components/Pagination";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Select, inputBase } from "@/components/ui/Field";
import type { CVItem, CVListResponse } from "@/types/cv";

const PAGE_SIZE = 25;

type Toast = { id: number; tone: "success" | "error"; message: string };

export default function AdminDashboardPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<CVListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState<"csv" | "zip" | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<CVItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const notify = useCallback((tone: Toast["tone"], message: string) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), tone, message });
    toastTimer.current = setTimeout(() => setToast(null), tone === "error" ? 7000 : 4000);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Debounce the free-text search box.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 whenever filters change.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedDomains, sort]);

  const loadDomains = useCallback(() => {
    fetch("/api/domains")
      .then((res) => res.json())
      .then((d) => setDomains(d.existing ?? []))
      .catch(() => setDomains([]));
  }, []);

  useEffect(() => {
    loadDomains();
  }, [loadDomains]);

  const loadCvs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (selectedDomains.length) params.set("domains", selectedDomains.join(","));
      params.set("sort", sort);
      params.set("page", String(page));
      params.set("pageSize", String(PAGE_SIZE));

      const res = await fetch(`/api/cvs?${params.toString()}`);
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "The candidate list didn't load.");
        return;
      }
      setData(json);
    } catch {
      setError("Couldn't reach the server, so the candidate list didn't load.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedDomains, sort, page, router]);

  useEffect(() => {
    loadCvs();
  }, [loadCvs]);

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllOnPage() {
    if (!data) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = data.items.every((i) => next.has(i.id));
      data.items.forEach((i) => {
        if (allSelected) next.delete(i.id);
        else next.add(i.id);
      });
      return next;
    });
  }

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setSelectedDomains([]);
  }

  async function confirmDelete() {
    const item = pendingDelete;
    if (!item) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/cvs/${item.id}`, { method: "DELETE" });
      if (!res.ok) {
        setDeleteError("The CV wasn't deleted because the server returned an error. Try again.");
        return;
      }
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      setPendingDelete(null);
      notify("success", `Deleted ${item.fullName}'s CV`);
      loadCvs();
      loadDomains();
    } catch {
      setDeleteError("Couldn't reach the server, so the CV wasn't deleted. Try again.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleExport(format: "csv" | "zip") {
    const count = selectedIds.size;
    if (count === 0 || exporting) return;
    setExporting(format);
    try {
      const res = await fetch("/api/admin/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), format }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        notify("error", json.error ?? "The export failed on the server. Try again with fewer CVs selected.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bk-cv-export-${Date.now()}.${format === "csv" ? "csv" : "zip"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      const people = count === 1 ? "1 candidate" : `${count} candidates`;
      notify(
        "success",
        format === "csv" ? `Exported details for ${people}` : `Downloaded CVs for ${people}`
      );
    } catch {
      notify("error", "Couldn't reach the server, so nothing was exported. Try again.");
    } finally {
      setExporting(null);
    }
  }

  async function copyFormLink() {
    const link = `${window.location.origin}/apply`;
    try {
      await navigator.clipboard.writeText(link);
      notify("success", "Form link copied. Paste it into a post or message.");
    } catch {
      notify("error", `Couldn't copy automatically. The link is ${link}`);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.push("/admin");
  }

  const hasFilters = Boolean(debouncedSearch) || selectedDomains.length > 0;
  const total = data?.total ?? 0;
  const items = data?.items ?? [];
  const selectedCount = selectedIds.size;

  const countLine = !data
    ? "Loading candidates"
    : hasFilters
    ? `${total} ${total === 1 ? "candidate matches" : "candidates match"} your filters`
    : `${total} ${total === 1 ? "candidate" : "candidates"} on file`;

  const headerButton =
    "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-pine-100 hover:bg-white/10 hover:text-white";

  return (
    <div className={clsx("min-h-dvh", selectedCount > 0 ? "pb-32" : "pb-12")}>
      <header className="on-dark bg-pine-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
          <Brand tone="dark" href="/admin/dashboard" suffix="Admin" compact />
          <div className="flex items-center gap-0.5">
            <a href="/" target="_blank" rel="noopener noreferrer" className={headerButton}>
              <ExternalLink className="h-4 w-4" aria-hidden />
              <span className="hidden md:inline">Public page</span>
              <span className="sr-only md:hidden">Public page</span>
            </a>
            <button type="button" onClick={() => setShowChangePassword(true)} className={headerButton}>
              <KeyRound className="h-4 w-4" aria-hidden />
              <span className="hidden md:inline">Change password</span>
              <span className="sr-only md:hidden">Change password</span>
            </button>
            <button type="button" onClick={handleLogout} className={headerButton}>
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="hidden md:inline">Sign out</span>
              <span className="sr-only md:hidden">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-[-0.025em] text-pine-900">
              Candidates
            </h1>
            <p className="mt-1 text-muted" aria-live="polite">
              {countLine}
            </p>
          </div>
          <Button variant="secondary" onClick={copyFormLink} className="self-start sm:self-auto">
            <Link2 className="h-4 w-4" aria-hidden />
            Copy form link
          </Button>
        </div>

        {/* Search, filter, sort */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-md">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, skills, role, company or city"
              aria-label="Search candidates"
              className={clsx(
                inputBase,
                "h-11 border-pine-200 pl-10 pr-10 hover:border-pine-300 focus:border-pine-500 focus:ring-pine-500/15 [&::-webkit-search-cancel-button]:hidden"
              )}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-pine-50 hover:text-pine-900"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>

          <DomainFilter options={domains} selected={selectedDomains} onChange={setSelectedDomains} />

          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="sm:w-52"
            aria-label="Sort candidates"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name, A to Z</option>
            <option value="experience">Most experienced first</option>
          </Select>
        </div>

        {/* Active filters */}
        {hasFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {debouncedSearch && (
              <FilterChip label={`Search: ${debouncedSearch}`} onRemove={() => setSearch("")} />
            )}
            {selectedDomains.map((d) => (
              <FilterChip
                key={d}
                label={d}
                onRemove={() => setSelectedDomains(selectedDomains.filter((x) => x !== d))}
              />
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full px-2 py-1 text-sm font-semibold text-pine-700 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="mt-5">
          {error && (
            <div
              role="alert"
              className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
              <span className="flex-1">{error}</span>
              <Button variant="secondary" size="sm" onClick={loadCvs}>
                Try again
              </Button>
            </div>
          )}

          {!data && loading ? (
            <ListSkeleton />
          ) : items.length === 0 && !error ? (
            hasFilters ? (
              <EmptyState
                icon={SearchX}
                title="No candidates match these filters"
                body="Try a shorter search, or clear the filters to see everyone on file."
              >
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              </EmptyState>
            ) : (
              <EmptyState
                icon={Inbox}
                title="No CVs on file yet"
                body="Share the form link on LinkedIn or WhatsApp. Each CV appears here as soon as it's sent."
              >
                <Button onClick={copyFormLink}>
                  <Link2 className="h-4 w-4" aria-hidden />
                  Copy form link
                </Button>
              </EmptyState>
            )
          ) : (
            <>
              {items.length > 0 && selectedCount === 0 && (
                <p className="mb-3 text-sm text-muted">
                  Tick candidates to export their details as a spreadsheet or download their CVs as a ZIP.
                </p>
              )}
              <CVTable
                items={items}
                selected={selectedIds}
                onToggle={toggleOne}
                onToggleAll={toggleAllOnPage}
                onDelete={(item) => {
                  setDeleteError("");
                  setPendingDelete(item);
                }}
                loading={loading}
              />
              {data && (
                <Pagination
                  page={data.page}
                  totalPages={data.totalPages}
                  total={data.total}
                  pageSize={data.pageSize}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Selection bar */}
      {selectedCount > 0 && (
        <div className="on-dark fixed inset-x-0 bottom-0 z-30 px-3 pb-3 sm:bottom-4 sm:px-5 sm:pb-0">
          <div className="mx-auto flex max-w-3xl animate-rise-in flex-col gap-3 rounded-2xl bg-pine-900 p-3 pl-5 text-white shadow-bar sm:flex-row sm:items-center sm:rounded-full sm:p-2 sm:pl-6">
            <div className="flex flex-1 items-center justify-between gap-3">
              <p className="font-semibold" aria-live="polite">
                {selectedCount} selected
              </p>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="rounded-full px-3 py-1.5 text-sm font-semibold text-pine-100 hover:bg-white/10 hover:text-white"
              >
                Clear selection
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={exporting !== null}
                onClick={() => handleExport("csv")}
                title="Spreadsheet (CSV) of the selected candidates' details"
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/25 px-4 text-sm font-semibold hover:bg-white/10 disabled:opacity-60 sm:flex-none"
              >
                {exporting === "csv" ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Download className="h-4 w-4" aria-hidden />
                )}
                Export details
              </button>
              <button
                type="button"
                disabled={exporting !== null}
                onClick={() => handleExport("zip")}
                title="ZIP file of the selected candidates' CVs"
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-marigold-400 px-4 text-sm font-semibold text-pine-900 hover:bg-marigold-300 disabled:opacity-60 sm:flex-none"
              >
                {exporting === "zip" ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <FileArchive className="h-4 w-4" aria-hidden />
                )}
                Download CVs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div
        className={clsx(
          "pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4",
          selectedCount > 0 ? "bottom-36 sm:bottom-24" : "bottom-6"
        )}
        aria-live="polite"
      >
        {toast && (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className={clsx(
              "pointer-events-auto flex max-w-md animate-rise-in items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-lift",
              toast.tone === "error" ? "bg-red-700 text-white" : "bg-white text-pine-900 ring-1 ring-line"
            )}
          >
            {toast.tone === "error" ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-pine-500" aria-hidden />
            )}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss"
              className="-mr-1 ml-1 rounded-full p-0.5 opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title={`Delete ${pendingDelete.fullName}'s CV?`}
          confirmLabel="Delete CV"
          busyLabel="Deleting CV"
          busy={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onClose={() => setPendingDelete(null)}
        >
          This removes {pendingDelete.fullName} from the registry along with
          the CV file. It can&apos;t be undone.
        </ConfirmDialog>
      )}

      {showChangePassword && (
        <ChangePasswordDialog onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex h-8 max-w-full items-center gap-1 rounded-full bg-pine-100 pl-3 pr-1 text-sm font-medium text-pine-800">
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter ${label}`}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-pine-200"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </span>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
  children,
}: {
  icon: typeof Inbox;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-pine-200 bg-white px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-pine-100 text-pine-700">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-pine-900">
        {title}
      </h2>
      <p className="mt-2 max-w-[44ch] leading-relaxed text-muted">{body}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-xl border border-line bg-white"
      role="status"
      aria-label="Loading candidates"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-4 border-b border-line px-4 py-4 last:border-0"
        >
          <span className="h-[18px] w-[18px] rounded-[5px] bg-pine-100" />
          <span className="h-10 w-10 rounded-full bg-pine-100" />
          <span className="flex-1 space-y-2">
            <span className="block h-3.5 w-40 max-w-full rounded bg-pine-100" />
            <span className="block h-3 w-56 max-w-full rounded bg-pine-50" />
          </span>
          <span className="hidden h-6 w-28 rounded-full bg-pine-50 md:block" />
          <span className="hidden h-3.5 w-24 rounded bg-pine-50 lg:block" />
          <span className="hidden h-9 w-24 rounded-full bg-pine-50 sm:block" />
        </div>
      ))}
    </div>
  );
}
