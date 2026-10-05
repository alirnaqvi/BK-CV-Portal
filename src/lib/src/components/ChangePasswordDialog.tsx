"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
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

  // Close automatically shortly after a successful change.
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(onClose, 2200);
    return () => clearTimeout(t);
  }, [success, onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!currentPassword) {
      setError("Enter your current password");
      return;
    }
    if (newPassword.length < MIN_LENGTH) {
      setError(`The new password needs at least ${MIN_LENGTH} characters`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("The new password and the confirmation don't match");
      return;
    }
    if (newPassword === currentPassword) {
      setError("Choose a new password that's different from the current one");
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
        setError(data.error ?? "The password wasn't changed. Try again in a minute.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch {
      setError("Couldn't reach the server, so the password wasn't changed. Try again.");
      setLoading(false);
    }
  }

  return (
    <Dialog
      titleId="change-password-title"
      title="Change password"
      onClose={onClose}
      locked={loading}
    >
      {success ? (
        <p
          role="status"
          className="mt-5 flex items-start gap-2.5 rounded-xl bg-pine-50 px-4 py-3.5 text-[15px] font-medium text-pine-800"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-pine-500" aria-hidden />
          Password changed. Use the new one next time you sign in.
        </p>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-4">
          <Field label="Current password" htmlFor="currentPassword">
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoFocus
            />
          </Field>
          <Field
            label="New password"
            htmlFor="newPassword"
            hint={`At least ${MIN_LENGTH} characters`}
          >
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Field>
          <Field label="Confirm new password" htmlFor="confirmPassword">
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Field>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
              {error}
            </p>
          )}

          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {loading ? "Changing password" : "Change password"}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
