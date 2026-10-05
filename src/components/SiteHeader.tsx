import Link from "next/link";
import clsx from "clsx";
import { Linkedin, LogIn } from "lucide-react";
import { Brand } from "@/components/Brand";
import { buttonClasses } from "@/components/ui/Button";
import { SITE } from "@/lib/site";

export function SiteHeader({
  showCta = true,
  showAdmin = false,
}: {
  showCta?: boolean;
  /** Adds the admin sign-in button (used on the landing page). */
  showAdmin?: boolean;
}) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-5 py-5 sm:gap-4 sm:px-8">
      {/* With the extra button, the narrowest phones show just the BK mark. */}
      <Brand tailClassName={showAdmin ? "max-[374px]:hidden" : undefined} />
      <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
        <a
          href={SITE.owner.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            "h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-pine-700 hover:bg-pine-100/70",
            // On phones the admin button takes this spot; the LinkedIn link
            // is still further down the page.
            showAdmin ? "hidden md:inline-flex" : "inline-flex"
          )}
        >
          <Linkedin className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{SITE.owner.firstName} on LinkedIn</span>
          <span className="sr-only sm:hidden">{SITE.owner.firstName} on LinkedIn</span>
        </a>
        {showAdmin && (
          // Goes to the dashboard: if the session is still valid it opens
          // straight away, otherwise the middleware sends it to the sign-in page.
          <Link
            href="/admin/dashboard"
            prefetch={false}
            className={buttonClasses("secondary", "sm")}
          >
            <LogIn className="hidden h-4 w-4 sm:block" aria-hidden />
            Admin sign in
          </Link>
        )}
        {showCta && (
          // On phones with the admin button present there's no room for both;
          // the main "Send your CV" button sits just below in the hero.
          <Link
            href="/apply"
            className={buttonClasses("primary", "sm", showAdmin ? "max-sm:hidden" : undefined)}
          >
            Send your CV
          </Link>
        )}
      </nav>
    </header>
  );
}
