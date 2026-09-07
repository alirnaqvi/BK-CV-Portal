import Link from "next/link";
import { FileUp, ShieldCheck, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-ink-800 text-paper">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-10">
        <p className="text-xs font-medium tracking-wide text-brass-300">
          BK Talent Registry
        </p>
        <h1 className="mt-4 max-w-xl text-center font-serif text-3xl font-semibold leading-tight sm:text-4xl">
          One place for CVs, in and out.
        </h1>
        <p className="mt-3 max-w-md text-center text-sm text-ink-100">
          Choose how you'd like to continue.
        </p>

        <div className="mt-10 grid w-full max-w-3xl gap-5 sm:grid-cols-2">
          <Link
            href="/apply"
            className="group flex flex-col justify-between rounded-sm border border-ink-500 bg-ink-700 p-7 transition-colors hover:border-brass-400 hover:bg-ink-600"
          >
            <div>
              <FileUp className="h-6 w-6 text-brass-300" aria-hidden />
              <h2 className="mt-4 font-serif text-xl font-semibold text-paper">
                I'm a candidate
              </h2>
              <p className="mt-2 text-sm text-ink-100">
                Submit your CV and details to be considered for upcoming
                opportunities.
              </p>
            </div>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-brass-300">
              Submit your CV
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </Link>

          <Link
            href="/admin"
            className="group flex flex-col justify-between rounded-sm border border-ink-500 bg-ink-700 p-7 transition-colors hover:border-brass-400 hover:bg-ink-600"
          >
            <div>
              <ShieldCheck className="h-6 w-6 text-brass-300" aria-hidden />
              <h2 className="mt-4 font-serif text-xl font-semibold text-paper">
                I'm BK (admin)
              </h2>
              <p className="mt-2 text-sm text-ink-100">
                Sign in to search, filter, and export CVs to share with
                companies.
              </p>
            </div>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-brass-300">
              Go to admin login
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </Link>
        </div>
      </div>

      <p className="pb-8 text-center text-xs text-ink-300">
        Your details are kept on file and shared only with employers relevant
        to your background.
      </p>
    </main>
  );
}
