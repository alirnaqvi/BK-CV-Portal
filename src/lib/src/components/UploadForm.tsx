"use client";

import { DragEvent, FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Circle,
  FileText,
  Loader2,
  Send,
  UploadCloud,
  X,
} from "lucide-react";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { RegistryCard } from "@/components/RegistryCard";
import {
  ACCEPTED_FILE_EXTENSIONS,
  FORM_MAX_FILE_SIZE_BYTES,
  SUGGESTED_DOMAINS,
} from "@/lib/constants";
import { formatFileSize } from "@/lib/format";
import { FEATURED_DOMAINS, SITE } from "@/lib/site";

const TEXT_FIELDS = [
  "fullName",
  "email",
  "phone",
  "city",
  "domain",
  "experienceYears",
  "currentRole",
  "currentCompany",
  "education",
  "skills",
] as const;

type TextField = (typeof TEXT_FIELDS)[number];
type FieldName = TextField | "cv";
type Values = Record<TextField, string>;
type Errors = Partial<Record<FieldName, string>>;

const EMPTY: Values = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  domain: "",
  experienceYears: "",
  currentRole: "",
  currentCompany: "",
  education: "",
  skills: "",
};

// Order used to move focus to the first problem after a failed submit.
const FOCUS_ORDER: FieldName[] = [
  "fullName",
  "email",
  "phone",
  "city",
  "domain",
  "experienceYears",
  "currentRole",
  "currentCompany",
  "education",
  "skills",
  "cv",
];

const MAX_MB = Math.round(FORM_MAX_FILE_SIZE_BYTES / (1024 * 1024));
const ALLOWED_EXTENSIONS = ACCEPTED_FILE_EXTENSIONS.split(",");

/** Key used to hand the submitted details to the confirmation page. */
export const LAST_SUBMISSION_KEY = "bk:last-submission";

function validateText(name: TextField, raw: string): string | undefined {
  const value = raw.trim();
  switch (name) {
    case "fullName":
      if (value.length < 2) return "Enter your full name";
      break;
    case "email":
      if (!value) return "Enter your email address";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value))
        return "Enter a valid email address, like name@example.com";
      break;
    case "domain":
      if (value.length < 2) return "Choose a field or type your own";
      break;
    case "experienceYears":
      if (value === "") break;
      if (!/^\d{1,2}$/.test(value) || Number(value) > 60)
        return "Enter a whole number between 0 and 60";
      break;
  }
  return undefined;
}

function validateFile(file: File | null): string | undefined {
  if (!file) return "Attach your CV as a PDF or Word document";
  const dot = file.name.lastIndexOf(".");
  const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `That file is ${ext ? `a ${ext} file` : "not a recognised type"}. Attach a PDF, DOC or DOCX instead.`;
  }
  if (file.size === 0) return "That file is empty. Choose a different one.";
  if (file.size > FORM_MAX_FILE_SIZE_BYTES) {
    return `That file is ${formatFileSize(file.size)}. The limit is ${MAX_MB} MB, so save a smaller PDF and attach it again.`;
  }
  return undefined;
}

export function UploadForm({ initialDomain = "" }: { initialDomain?: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<Values>({ ...EMPTY, domain: initialDomain });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [domainOptions, setDomainOptions] = useState<string[]>(SUGGESTED_DOMAINS);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetch("/api/domains")
      .then((res) => res.json())
      .then((data) => {
        const merged = Array.from(
          new Set<string>([...(data.suggested ?? []), ...(data.existing ?? [])])
        ).sort();
        if (merged.length) setDomainOptions(merged);
      })
      .catch(() => {
        /* keep the default suggested list */
      });
  }, []);

  function setValue(name: TextField, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear an error as soon as the person starts fixing it.
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleBlur(name: TextField) {
    let value = values[name].trim().replace(/\s+/g, " ");
    if (name === "domain" && value) {
      // Snap to the listed spelling so "it" and "IT" don't become two filters.
      const match = domainOptions.find(
        (option) => option.toLowerCase() === value.toLowerCase()
      );
      if (match) value = match;
    }
    if (value !== values[name]) setValues((prev) => ({ ...prev, [name]: value }));
    // Only flag fields the person has actually filled in; empty required
    // fields are reported when they try to send.
    if (value) setErrors((prev) => ({ ...prev, [name]: validateText(name, value) }));
  }

  function chooseFile(next: File | null) {
    setFile(next);
    setErrors((prev) => ({ ...prev, cv: next ? validateFile(next) : undefined }));
    if (!next && fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) chooseFile(dropped);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setFormError("");

    const nextErrors: Errors = {};
    for (const name of TEXT_FIELDS) {
      const message = validateText(name, values[name]);
      if (message) nextErrors[name] = message;
    }
    const fileMessage = validateFile(file);
    if (fileMessage) nextErrors.cv = fileMessage;

    setErrors(nextErrors);
    const firstBad = FOCUS_ORDER.find((name) => nextErrors[name]);
    if (firstBad) {
      const el = document.getElementById(firstBad);
      el?.focus({ preventScroll: true });
      el?.closest("[data-field]")?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    const formData = new FormData();
    for (const name of TEXT_FIELDS) formData.set(name, values[name].trim());
    formData.set("cv", file as File);

    setSubmitting(true);
    try {
      const res = await fetch("/api/cvs", { method: "POST", body: formData });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setFormError(
          res.status === 413
            ? "The server rejected that file as too large. Save a smaller PDF and send it again."
            : data?.error ?? "Your CV wasn't sent because the server returned an error. Wait a minute and send it again."
        );
        setSubmitting(false);
        return;
      }

      try {
        sessionStorage.setItem(
          LAST_SUBMISSION_KEY,
          JSON.stringify({
            fullName: values.fullName.trim(),
            domain: values.domain.trim(),
            currentRole: values.currentRole.trim(),
            currentCompany: values.currentCompany.trim(),
            city: values.city.trim(),
            experienceYears:
              values.experienceYears === "" ? null : Number(values.experienceYears),
            education: values.education.trim(),
            skills: values.skills.trim(),
            fileName: file?.name ?? "",
            fileSize: file?.size ?? null,
          })
        );
      } catch {
        /* the confirmation page works without it */
      }

      router.push("/thank-you");
    } catch {
      setFormError(
        "Your CV wasn't sent because the connection dropped. Check your internet and send it again."
      );
      setSubmitting(false);
    }
  }

  const required = [
    { label: "Full name", need: "your full name", done: !validateText("fullName", values.fullName) },
    { label: "Email", need: "your email", done: !validateText("email", values.email) },
    { label: "Field", need: "your field", done: !validateText("domain", values.domain) },
    { label: "CV", need: "your CV", done: !validateFile(file) },
  ];
  const doneCount = required.filter((r) => r.done).length;
  const missing = required.filter((r) => !r.done).map((r) => r.need);

  const cardData = {
    fullName: values.fullName.trim(),
    domain: values.domain.trim(),
    currentRole: values.currentRole.trim(),
    currentCompany: values.currentCompany.trim(),
    city: values.city.trim(),
    experienceYears:
      values.experienceYears !== "" && !validateText("experienceYears", values.experienceYears)
        ? Number(values.experienceYears)
        : null,
    education: values.education.trim(),
    skills: values.skills,
    fileName: file && !errors.cv ? file.name : "",
    fileSize: file?.size ?? null,
  };

  const text = (name: TextField) => ({
    id: name,
    name,
    value: values[name],
    invalid: Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
    onChange: (e: { target: { value: string } }) => setValue(name, e.target.value),
    onBlur: () => handleBlur(name),
  });

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        <datalist id="domain-options">
          {domainOptions.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>

        <Section number={1} title="About you">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div data-field>
              <Field label="Full name" htmlFor="fullName" required error={errors.fullName}>
                <Input {...text("fullName")} autoComplete="name" aria-required maxLength={120} />
              </Field>
            </div>
            <div data-field>
              <Field
                label="Email"
                htmlFor="email"
                required
                error={errors.email}
                hint={`${SITE.owner.firstName} replies to this address, so check it for typos`}
              >
                <Input
                  {...text("email")}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-required
                  maxLength={160}
                />
              </Field>
            </div>
            <div data-field>
              <Field label="Phone" htmlFor="phone" optional hint="Include the country code, like +92">
                <Input {...text("phone")} type="tel" inputMode="tel" autoComplete="tel" maxLength={40} />
              </Field>
            </div>
            <div data-field>
              <Field label="City" htmlFor="city" optional>
                <Input {...text("city")} autoComplete="address-level2" maxLength={80} />
              </Field>
            </div>
          </div>
        </Section>

        <Section number={2} title="Your work">
          <div data-field>
            <Field
              label="Field"
              htmlFor="domain"
              required
              error={errors.domain}
              hint="Pick one below, or type your own"
            >
              <Input
                {...text("domain")}
                list="domain-options"
                placeholder="For example, Finance & Accounting"
                aria-required
                maxLength={80}
              />
            </Field>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Common fields">
              {FEATURED_DOMAINS.map((d) => {
                const active = values.domain.trim().toLowerCase() === d.toLowerCase();
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setValue("domain", active ? "" : d)}
                    className={clsx(
                      "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
                      active
                        ? "border-pine-800 bg-pine-800 text-white"
                        : "border-pine-200 bg-white text-pine-800 hover:border-pine-400 hover:bg-pine-50"
                    )}
                  >
                    {active && <Check className="h-3.5 w-3.5" aria-hidden />}
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div data-field>
              <Field
                label="Years of experience"
                htmlFor="experienceYears"
                optional
                error={errors.experienceYears}
              >
                <Input {...text("experienceYears")} inputMode="numeric" maxLength={2} />
              </Field>
            </div>
            <div data-field>
              <Field label="Current or most recent role" htmlFor="currentRole" optional>
                <Input {...text("currentRole")} autoComplete="organization-title" maxLength={120} />
              </Field>
            </div>
            <div data-field>
              <Field label="Current or most recent company" htmlFor="currentCompany" optional>
                <Input {...text("currentCompany")} autoComplete="organization" maxLength={120} />
              </Field>
            </div>
            <div data-field>
              <Field label="Education" htmlFor="education" optional hint="Degree, institution and year">
                <Input {...text("education")} maxLength={200} />
              </Field>
            </div>
          </div>

          <div className="mt-5" data-field>
            <Field
              label="Key skills"
              htmlFor="skills"
              optional
              hint="Separate with commas, like SQL, Financial modelling, Recruitment"
            >
              <Textarea {...text("skills")} rows={2} maxLength={500} />
            </Field>
          </div>
        </Section>

        <Section number={3} title="Your CV">
          <div data-field>
            <input
              ref={fileInputRef}
              id="cv"
              name="cv"
              type="file"
              accept={ACCEPTED_FILE_EXTENSIONS}
              className="peer sr-only"
              aria-required
              aria-invalid={Boolean(errors.cv) || undefined}
              aria-describedby={errors.cv ? "cv-error" : "cv-hint"}
              onChange={(e) => chooseFile(e.target.files?.[0] ?? null)}
            />

            {file ? (
              <div
                className={clsx(
                  "flex items-center gap-3 rounded-xl border bg-white p-4 peer-focus-visible:ring-4 peer-focus-visible:ring-pine-500/20",
                  errors.cv ? "border-red-400" : "border-pine-300"
                )}
              >
                <span
                  className={clsx(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px]",
                    errors.cv ? "bg-red-50 text-red-700" : "bg-pine-100 text-pine-700"
                  )}
                >
                  <FileText className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-pine-900">{file.name}</p>
                  <p className="text-[13px] text-muted">{formatFileSize(file.size)}</p>
                </div>
                <label
                  htmlFor="cv"
                  className="inline-flex h-9 cursor-pointer items-center rounded-full px-3 text-sm font-semibold text-pine-700 hover:bg-pine-100/70"
                >
                  Replace
                </label>
                <button
                  type="button"
                  onClick={() => chooseFile(null)}
                  aria-label={`Remove ${file.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-red-50 hover:text-red-700"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ) : (
              <label
                htmlFor="cv"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={clsx(
                  "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-9 text-center transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-pine-500/20",
                  dragActive
                    ? "border-pine-500 bg-pine-50"
                    : errors.cv
                    ? "border-red-300 bg-red-50/40 hover:border-red-400"
                    : "border-pine-200 bg-white hover:border-pine-400 hover:bg-pine-50/60"
                )}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-marigold-100 text-marigold-700">
                  <UploadCloud className="h-6 w-6" aria-hidden />
                </span>
                <span className="mt-1 font-semibold text-pine-900">
                  <span className="hidden sm:inline">Drop your CV here, or </span>
                  <span className="text-pine-600 underline underline-offset-2">
                    choose a file
                  </span>
                </span>
                <span id="cv-hint" className="text-[13px] text-muted">
                  PDF, DOC or DOCX, up to {MAX_MB} MB
                </span>
              </label>
            )}

            {errors.cv && (
              <p
                id="cv-error"
                role="alert"
                className="mt-2 flex items-start gap-1.5 text-[13px] font-medium leading-snug text-red-700"
              >
                <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
                {errors.cv}
              </p>
            )}
          </div>
        </Section>

        {/* On small screens the card sits here, as a last look before sending. */}
        <div className="lg:hidden">
          <p className="mb-1 text-sm font-semibold text-pine-900">
            Your card in the registry
          </p>
          <RegistryCard data={cardData} />
        </div>

        <div className="flex flex-col gap-4">
          {formError && (
            <p
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {formError}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
              {submitting ? (
                <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden />
              ) : (
                <Send className="h-[18px] w-[18px]" aria-hidden />
              )}
              {submitting ? "Sending your CV" : "Send my CV"}
            </Button>
            <p className="text-sm text-muted" aria-live="polite">
              {missing.length === 0
                ? "Everything required is filled in."
                : `Still needed: ${missing.join(", ")}.`}
            </p>
          </div>

          <p className="max-w-[62ch] text-[13px] leading-relaxed text-muted">
            By sending, you agree that {SITE.owner.name} may keep your details
            and CV on file and share them with employers hiring for roles that
            match your profile.
          </p>
        </div>
      </form>

      {/* Live preview, pinned beside the form on wide screens. */}
      <aside className="sticky top-8 hidden lg:block" aria-label="Preview of your registry card">
        <p className="text-sm font-semibold text-pine-900">Your card in the registry</p>
        <p className="mt-1 text-[13px] text-muted">
          This is how {SITE.owner.firstName} sees you. It fills in as you type.
        </p>
        <RegistryCard data={cardData} className="mt-3" />

        <div className="mt-6 rounded-xl border border-line bg-white p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-pine-900">Required to send</span>
            <span className="text-muted">
              {doneCount} of {required.length}
            </span>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-pine-100">
            <div
              className="h-full rounded-full bg-pine-500 transition-[width] duration-300"
              style={{ width: `${(doneCount / required.length) * 100}%` }}
            />
          </div>
          <ul className="mt-3.5 grid grid-cols-2 gap-y-2 text-sm">
            {required.map((item) => (
              <li
                key={item.label}
                className={clsx(
                  "flex items-center gap-2",
                  item.done ? "text-pine-800" : "text-muted"
                )}
              >
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-pine-500" aria-hidden />
                ) : (
                  <Circle className="h-4 w-4 text-pine-200" aria-hidden />
                )}
                {item.label}
                <span className="sr-only">{item.done ? "done" : "not done yet"}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 sm:p-7">
      <h2 className="mb-5 flex items-center gap-3 font-display text-xl font-bold tracking-tight text-pine-900">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pine-800 text-sm text-marigold-300">
          {number}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
