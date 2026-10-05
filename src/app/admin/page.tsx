"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Brand } from "@/components/Brand";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password) {
      setError("Enter the admin password");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          res.status === 401
            ? "That password isn't right. Check it and try again."
            : data.error ?? "Sign-in failed on the server. Try again in a minute."
        );
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="on-dark flex min-h-dvh flex-col bg-pine-800">
      <header className="mx-auto w-full max-w-6xl px-5 py-5 sm:px-8">
        <Brand tone="dark" />
      </header>

      <main className="flex flex-1 items-center justify-center px-5 pb-24">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-lift sm:p-8"
        >
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-pine-900">
            Admin sign in
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            Enter the admin password to search, filter and export the CVs on
            file.
          </p>

          <div className="mt-6">
            <Field label="Password" htmlFor="password" error={error}>
              <div className="relative">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  autoComplete="current-password"
                  autoFocus
                  invalid={Boolean(error)}
                  aria-describedby={error ? "password-error" : undefined}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  aria-pressed={show}
                  className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-pine-50 hover:text-pine-800"
                >
                  {show ? (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>
            </Field>
          </div>

          <Button type="submit" disabled={loading} className="mt-6 w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {loading ? "Signing in" : "Sign in"}
          </Button>

          <p className="mt-6 border-t border-line pt-5 text-sm text-muted">
            Here to send a CV?{" "}
            <Link href="/apply" className="font-semibold text-pine-700 hover:underline">
              Go to the CV form
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
