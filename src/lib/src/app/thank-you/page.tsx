import type { Metadata } from "next";
import Link from "next/link";
import { Linkedin } from "lucide-react";
import { Brand } from "@/components/Brand";
import { SubmissionReceipt } from "@/components/SubmissionReceipt";
import { buttonClasses } from "@/components/ui/Button";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Your CV is on file",
  robots: { index: false },
};

export default function ThankYouPage() {
  const { owner } = SITE;
  return (
    <div className="on-dark flex min-h-dvh flex-col bg-pine-800">
      <header className="mx-auto w-full max-w-6xl px-5 py-5 sm:px-8">
        <Brand tone="dark" />
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-5 pb-16 pt-6 text-center sm:pt-12">
        <SubmissionReceipt />

        <div className="mt-10 w-full rounded-2xl bg-white/[0.06] p-6 text-left">
          <h2 className="font-display text-lg font-bold text-white">
            What happens next
          </h2>
          <ul className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-pine-100">
            <li>
              There&apos;s nothing more to do. {owner.firstName} contacts you by
              email or phone when a role matches your background.
            </li>
            <li>
              Got a newer CV later? Send it the same way and {owner.firstName}{" "}
              will have the latest one.
            </li>
            <li>
              Follow {owner.firstName} on LinkedIn to see the roles he&apos;s
              hiring for.
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={owner.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("accent", "md")}
          >
            <Linkedin className="h-4 w-4" aria-hidden />
            Follow {owner.firstName} on LinkedIn
          </a>
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-semibold text-white hover:bg-white/10"
          >
            Back to the start
          </Link>
        </div>
      </main>
    </div>
  );
}
