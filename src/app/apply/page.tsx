import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { UploadForm } from "@/components/UploadForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Send your CV",
  description: `Add your CV to ${SITE.owner.name}'s registry. It takes about two minutes.`,
};

export default function ApplyPage({
  searchParams,
}: {
  searchParams: { domain?: string | string[] };
}) {
  const raw = Array.isArray(searchParams.domain)
    ? searchParams.domain[0]
    : searchParams.domain;
  const initialDomain = (raw ?? "").trim().slice(0, 80);

  return (
    <div className="min-h-dvh pb-16">
      <SiteHeader showCta={false} />
      <main className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="pb-8 pt-4 sm:pt-8">
          <h1 className="font-display text-4xl font-extrabold tracking-[-0.025em] text-pine-900 sm:text-5xl">
            Send your CV
          </h1>
          <p className="mt-3 max-w-[58ch] text-lg leading-relaxed text-muted">
            About two minutes. Only your name, email, field and CV are
            required, marked with an asterisk.
          </p>
        </div>
        <UploadForm initialDomain={initialDomain} />
      </main>
    </div>
  );
}
