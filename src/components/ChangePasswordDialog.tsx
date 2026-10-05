"use client";

import { FormEvent, useEffect, useState } from "react";
import { KeyRound, Loader2, X } from "lucide-react";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const MIN_LENGTH = 10;

export function ChangePasswordDialog({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Close on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loading, onClose]);

  // Close automatically shortly after a successful change.
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(onClose, 1800);
    return () => clearTimeout(t);
  }, [success, onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword.length < MIN_LENGTH) {
      setError(`New password must be at least ${MIN_LENGTH} characters`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from the current one");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Could not change the password");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch {
      setError("Could not reach the server. Try again.");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        className="w-full max-w-md rounded-sm border border-ledger bg-white p-6 shadow-lg"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-brass-600">
            <KeyRound className="h-4 w-4" aria-hidden />
            <h2
              id="change-password-title"
              className="font-serif text-xl font-semibold text-ink-800"
            >
              Change password
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
            className="rounded-sm p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-700"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {success ? (
          <p
            role="status"
            className="mt-5 rounded-sm bg-green-50 px-3 py-3 text-sm text-green-800"
          >
            Password updated. Use the new password the next time you sign in.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
            <Field label="Current password" htmlFor="currentPassword" required>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoFocus
                required
              />
            </Field>
            <Field
              label="New password"
              htmlFor="newPassword"
              required
              hint={`At least ${MIN_LENGTH} characters`}
            >
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Field>
            <Field label="Confirm new password" htmlFor="confirmPassword" required>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Field>

            {error && (
              <p role="alert" className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-1 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                {loading ? "Saving..." : "Update password"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
