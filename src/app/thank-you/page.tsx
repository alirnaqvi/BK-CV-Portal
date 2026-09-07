import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function ThankYouPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink-800 px-6">
      <div className="max-w-md text-center text-paper">
        <CheckCircle2 className="mx-auto h-10 w-10 text-brass-400" aria-hidden />
        <h1 className="mt-6 font-serif text-3xl font-semibold">
          Your CV is on file
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-100">
          Thanks for submitting your details. Bilal will reach out if a
          matching opportunity comes up. There&apos;s nothing else you need
          to do right now.
        </p>
        <Link
          href="/apply"
          className="mt-8 inline-block rounded-sm border border-ink-500 px-4 py-2 text-sm text-ink-100 transition-colors hover:bg-ink-700"
        >
          Submit another CV
        </Link>
      </div>
    </main>
  );
}
