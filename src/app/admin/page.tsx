"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Incorrect password");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink-800 px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-sm border border-ink-600 bg-ink-700 p-8"
      >
        <div className="flex items-center gap-2 text-brass-300">
          <Lock className="h-4 w-4" aria-hidden />
          <span className="text-xs font-medium tracking-wide">
            BK Talent Registry — Admin
          </span>
        </div>
        <h1 className="mt-4 font-serif text-2xl font-semibold text-paper">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-ink-200">
          Enter the admin password to view and manage submitted CVs.
        </p>

        <div className="mt-6">
          <Field label="Password" htmlFor="password" error={error}>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              className="bg-ink-800 text-paper placeholder:text-ink-400"
            />
          </Field>
        </div>

        <Button type="submit" disabled={loading} className="mt-6 w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </main>
  );
}
