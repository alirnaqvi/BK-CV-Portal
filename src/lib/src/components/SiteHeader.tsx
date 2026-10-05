import Link from "next/link";
import { Linkedin } from "lucide-react";
import { Brand } from "@/components/Brand";
import { buttonClasses } from "@/components/ui/Button";
import { SITE } from "@/lib/site";

export function SiteHeader({ showCta = true }: { showCta?: boolean }) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
      <Brand />
      <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
        <a
          href={SITE.owner.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-pine-700 hover:bg-pine-100/70"
        >
          <Linkedin className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{SITE.owner.firstName} on LinkedIn</span>
          <span className="sr-only sm:hidden">{SITE.owner.firstName} on LinkedIn</span>
        </a>
        {showCta && (
          <Link href="/apply" className={buttonClasses("primary", "sm")}>
            Send your CV
          </Link>
        )}
      </nav>
    </header>
  );
}
