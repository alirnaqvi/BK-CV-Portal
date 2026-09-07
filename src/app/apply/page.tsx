import { UploadForm } from "@/components/UploadForm";

export default function HomePage() {
  return (
    <main className="min-h-dvh lg:flex">
      <section className="relative flex flex-col justify-between bg-ink-800 px-8 py-12 text-paper sm:px-14 sm:py-16 lg:w-[42%] lg:px-16">
        <div>
          <p className="text-sm font-medium tracking-wide text-brass-300">
            BK Talent Registry
          </p>
          <h1 className="mt-6 max-w-md font-serif text-4xl font-semibold leading-tight text-paper sm:text-5xl">
            Put your CV in front of the right hiring managers.
          </h1>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-ink-100">
            Bilal Kazmi works with companies across banking, fintech, and
            technology to fill roles with strong, well-matched talent. Submit
            your CV once, and it stays on file for opportunities in your
            field as they come up.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-2 lg:mt-0">
          {[
            "Information Technology",
            "Finance & Banking",
            "Human Resources",
            "Operations",
            "Sales & Marketing",
          ].map((tag) => (
            <span
              key={tag}
              className="rounded-sm border border-ink-500 px-3 py-1 text-xs text-ink-100"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="mt-12 text-xs text-ink-300 lg:mt-16">
          Your details are kept on file and shared only with employers
          relevant to your background.
        </p>
      </section>

      <section className="flex-1 px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-serif text-2xl font-semibold text-ink-800">
            Submit your CV
          </h2>
          <p className="mt-2 text-sm text-ink-500">
            Takes about two minutes. Fields marked with an asterisk are
            required.
          </p>
          <div className="mt-8">
            <UploadForm />
          </div>
        </div>
      </section>
    </main>
  );
}
