import type { ReactNode } from "react";
import Link from "next/link";
import { Clock, FileText, Linkedin, Lock, Send, UserCheck } from "lucide-react";
import { BrandMark } from "@/components/Brand";
import { RegistryCard } from "@/components/RegistryCard";
import { SiteHeader } from "@/components/SiteHeader";
import { buttonClasses } from "@/components/ui/Button";
import { FEATURED_DOMAINS, SITE } from "@/lib/site";

const steps = [
  {
    title: "Fill in a short form",
    body: "Your name, email, field and CV are all that's required. The optional details help Bilal match you faster.",
  },
  {
    title: "Your CV goes on file",
    body: "It's filed under your field, so it comes up every time Bilal searches for that kind of role.",
  },
  {
    title: "Bilal contacts you when a role fits",
    body: "When an opening matches your background, he gets in touch and shares your CV with the hiring company.",
  },
];

export default function LandingPage() {
  const { owner } = SITE;
  const removalRoute = SITE.contactEmail
    ? `email ${SITE.contactEmail}`
    : `message ${owner.firstName} on LinkedIn`;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 overflow-hidden px-5 pb-16 pt-8 sm:px-8 sm:pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:overflow-visible lg:pb-24">
          <div>
            <h1 className="font-display text-4xl font-extrabold leading-[1.04] tracking-[-0.03em] text-pine-900 sm:text-5xl lg:text-6xl">
              <span className="block">Send your CV once.</span>
              <span className="block">Be considered every time a role fits.</span>
            </h1>
            <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted">
              {owner.name} hires for companies across banking, fintech and
              technology. Add your CV to his registry and he&apos;ll have it to
              hand whenever a role in your field opens.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href="/apply" className={buttonClasses("primary", "lg")}>
                <Send className="h-[18px] w-[18px]" aria-hidden />
                Send your CV
              </Link>
              <p className="flex items-center gap-1.5 text-sm text-muted">
                <Clock className="h-4 w-4" aria-hidden />
                About two minutes. PDF or Word.
              </p>
            </div>
          </div>

          {/* Card stack: the one orchestrated moment on the page */}
          <div
            className="relative mx-auto w-full max-w-[400px] px-3 pb-4 lg:mr-0 lg:px-0"
            aria-hidden
          >
            <div className="absolute inset-x-3 bottom-4 top-7 translate-x-3 translate-y-3 rotate-[5deg] rounded-2xl bg-pine-700 lg:inset-x-0" />
            <div className="absolute inset-x-3 bottom-4 top-7 -translate-x-1 translate-y-1.5 -rotate-[3deg] rounded-2xl bg-marigold-300 lg:inset-x-0" />
            <RegistryCard
              sample
              stamped
              animateStamp
              className="relative"
              data={{
                fullName: "Your name",
                domain: "Your field",
                currentRole: "Your role",
                currentCompany: "your company",
                city: "Your city",
                experienceText: "Your years of experience",
                education: "Your degree",
                skills: "Your, key, skills",
                fileName: "Your CV.pdf",
              }}
            />
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="border-y border-line bg-white"
          aria-labelledby="how-heading"
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
            <h2
              id="how-heading"
              className="font-display text-3xl font-bold tracking-tight text-pine-900 sm:text-4xl"
            >
              How the registry works
            </h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
              {steps.map((step, i) => (
                <li key={step.title} className="relative">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pine-800 font-display text-lg font-bold text-marigold-300">
                      {i + 1}
                    </span>
                    {i < steps.length - 1 && (
                      <span className="hidden h-px flex-1 bg-line md:block" />
                    )}
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-pine-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-[38ch] leading-relaxed text-muted">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
            <p className="mt-10 max-w-[70ch] text-sm text-muted">
              Being on file isn&apos;t a job offer or a guarantee of an
              interview. It means your CV is in front of {owner.firstName} when
              he&apos;s filling a role like yours.
            </p>
          </div>
        </section>

        {/* Fields */}
        <section
          className="on-dark bg-pine-800 text-white"
          aria-labelledby="fields-heading"
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
            <h2
              id="fields-heading"
              className="font-display text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Pick your field to start
            </h2>
            <p className="mt-3 max-w-[56ch] text-pine-100">
              These are the fields {owner.firstName} hires for most often. If
              yours isn&apos;t here, you can type it in on the form.
            </p>
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {FEATURED_DOMAINS.map((domain) => (
                <li key={domain}>
                  <Link
                    href={`/apply?domain=${encodeURIComponent(domain)}`}
                    className="inline-flex h-11 items-center rounded-full border border-white/25 px-5 text-[15px] font-medium text-white transition-colors hover:border-marigold-400 hover:bg-marigold-400 hover:text-pine-900"
                  >
                    {domain}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/apply"
                  className="inline-flex h-11 items-center rounded-full border border-dashed border-white/40 px-5 text-[15px] font-medium text-pine-100 transition-colors hover:border-white hover:text-white"
                >
                  Another field
                </Link>
              </li>
            </ul>
          </div>
        </section>

        {/* Who and what happens to your data */}
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-pine-900 sm:text-3xl">
              Who reads your CV
            </h2>
            <div className="mt-6 flex items-start gap-4">
              {owner.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={owner.photo}
                  alt={owner.name}
                  className="h-16 w-16 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-pine-800 font-display text-xl font-bold text-marigold-300"
                  aria-hidden
                >
                  {SITE.shortName}
                </div>
              )}
              <div>
                <p className="font-display text-xl font-bold text-pine-900">
                  {owner.name}
                </p>
                <p className="text-sm text-muted">{owner.headline}</p>
              </div>
            </div>
            <p className="mt-5 max-w-[56ch] leading-relaxed text-muted">
              {owner.bio}
            </p>
            <a
              href={owner.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("secondary", "md", "mt-6")}
            >
              <Linkedin className="h-4 w-4" aria-hidden />
              View {owner.firstName}&apos;s LinkedIn profile
            </a>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-pine-900 sm:text-3xl">
              What happens to your details
            </h2>
            <ul className="mt-6 space-y-5">
              <Assurance icon={Lock} title={`Only ${owner.firstName} can open the registry`}>
                Your CV is stored privately. It isn&apos;t listed, searchable or
                visible to other candidates.
              </Assurance>
              <Assurance icon={UserCheck} title="Shared only for matching roles">
                Your CV goes to an employer only when they&apos;re hiring for a
                role that fits your profile.
              </Assurance>
              <Assurance icon={FileText} title="You can change or remove it">
                To update your CV, send a new one. To have your details
                removed, {removalRoute}.
              </Assurance>
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-6 w-6" />
            <span>
              {SITE.name}, kept by {owner.name}
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/apply" className="font-medium text-pine-700 hover:underline">
              Send your CV
            </Link>
            <Link href="/admin" className="hover:text-pine-800 hover:underline">
              Admin sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Assurance({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Lock;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-pine-100 text-pine-700">
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </span>
      <div>
        <p className="font-semibold text-pine-900">{title}</p>
        <p className="mt-1 max-w-[52ch] leading-relaxed text-muted">{children}</p>
      </div>
    </li>
  );
}
