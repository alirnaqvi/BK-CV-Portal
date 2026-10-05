"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileArchive, KeyRound, LogOut, Search, Loader2 } from "lucide-react";
import { DomainFilter } from "@/components/DomainFilter";
import { CVTable } from "@/components/CVTable";
import { Pagination } from "@/components/Pagination";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import type { CVItem, CVListResponse } from "@/types/cv";

const PAGE_SIZE = 25;

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

  // Debounce the free-text search box.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 whenever filters change.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedDomains, sort]);

  useEffect(() => {
    fetch("/api/domains")
      .then((res) => res.json())
      .then((d) => setDomains(d.existing ?? []))
      .catch(() => setDomains([]));
  }, []);

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
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to load CVs");
        return;
      }
      setData(json);
    } catch {
      setError("Could not reach the server.");
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

  async function handleDelete(item: CVItem) {
    if (!confirm(`Delete the CV submitted by ${item.fullName}? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/cvs/${item.id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Could not delete this CV. Try again.");
        return;
      }
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      loadCvs();
    } catch {
      alert("Could not reach the server.");
    }
  }

  async function handleExport(format: "csv" | "zip") {
    if (selectedIds.size === 0) return;
    setExporting(format);
    try {
      const res = await fetch("/api/admin/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), format }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.error ?? "Export failed");
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
    } catch {
      alert("Could not reach the server.");
    } finally {
      setExporting(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  return (
    <main className="min-h-dvh bg-ink-50/40">
      <header className="border-b border-ledger bg-white px-6 py-5 sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-brass-600">
              BK Talent Registry
            </p>
            <h1 className="font-serif text-2xl font-semibold text-ink-800">
              CV dashboard
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChangePassword(true)}
            >
              <KeyRound className="h-4 w-4" aria-hidden />
              Change password
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300"
                aria-hidden
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, skills, role..."
                className="w-full rounded-sm border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-ink placeholder:text-ink-300 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-300"
              />
            </div>

            <DomainFilter
              options={domains}
              selected={selectedDomains}
              onChange={setSelectedDomains}
            />

            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full sm:w-48"
              aria-label="Sort by"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name (A–Z)</option>
              <option value="experience">Most experienced</option>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-ink-500">
            {selectedIds.size > 0
              ? `${selectedIds.size} selected`
              : "Select CVs to export them"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={selectedIds.size === 0 || exporting !== null}
              onClick={() => handleExport("csv")}
            >
              {exporting === "csv" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Download className="h-4 w-4" aria-hidden />
              )}
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={selectedIds.size === 0 || exporting !== null}
              onClick={() => handleExport("zip")}
            >
              {exporting === "zip" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <FileArchive className="h-4 w-4" aria-hidden />
              )}
              Export CVs (.zip)
            </Button>
          </div>
        </div>

        <div className="mt-4 rounded-sm border border-ledger bg-white">
          {error && (
            <p className="px-4 py-3 text-sm text-red-600">{error}</p>
          )}
          {loading && !data ? (
            <div className="flex items-center justify-center py-16 text-ink-400">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            </div>
          ) : (
            <>
              <CVTable
                items={data?.items ?? []}
                selected={selectedIds}
                onToggle={toggleOne}
                onToggleAll={toggleAllOnPage}
                onDelete={handleDelete}
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
      </div>

      {showChangePassword && (
        <ChangePasswordDialog onClose={() => setShowChangePassword(false)} />
      )}
    </main>
  );
}
