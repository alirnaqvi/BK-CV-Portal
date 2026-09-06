"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2 } from "lucide-react";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ACCEPTED_FILE_EXTENSIONS, SUGGESTED_DOMAINS } from "@/lib/constants";

type FormErrors = Record<string, string>;

export function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [domainOptions, setDomainOptions] = useState<string[]>(SUGGESTED_DOMAINS);
  const [fileName, setFileName] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string>("");

  useEffect(() => {
    fetch("/api/domains")
      .then((res) => res.json())
      .then((data) => {
        const merged = Array.from(
          new Set([...(data.suggested ?? []), ...(data.existing ?? [])])
        ).sort();
        if (merged.length) setDomainOptions(merged);
      })
      .catch(() => {
        /* keep the default suggested list */
      });
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    setErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setErrors({ cv: "Attach your CV as a PDF or Word document" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/cvs", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push("/thank-you");
    } catch (err) {
      setFormError("Could not reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <datalist id="domain-options">
        {domainOptions.map((d) => (
          <option key={d} value={d} />
        ))}
      </datalist>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="fullName" required error={errors.fullName}>
          <Input id="fullName" name="fullName" required autoComplete="name" />
        </Field>
        <Field label="Email" htmlFor="email" required error={errors.email}>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </Field>
        <Field label="Phone" htmlFor="phone" hint="Optional, include country code">
          <Input id="phone" name="phone" type="tel" autoComplete="tel" />
        </Field>
        <Field label="City" htmlFor="city">
          <Input id="city" name="city" autoComplete="address-level2" />
        </Field>
        <Field
          label="Field / domain"
          htmlFor="domain"
          required
          hint="e.g. IT, Finance, HR, Marketing — pick from the list or type your own"
        >
          <Input id="domain" name="domain" list="domain-options" required />
        </Field>
        <Field label="Years of experience" htmlFor="experienceYears">
          <Input
            id="experienceYears"
            name="experienceYears"
            type="number"
            min={0}
            max={60}
            step={1}
          />
        </Field>
        <Field label="Current / most recent role" htmlFor="currentRole">
          <Input id="currentRole" name="currentRole" />
        </Field>
        <Field label="Current / most recent company" htmlFor="currentCompany">
          <Input id="currentCompany" name="currentCompany" />
        </Field>
      </div>

      <Field label="Education" htmlFor="education" hint="Degree, institution, year">
        <Input id="education" name="education" />
      </Field>

      <Field
        label="Key skills"
        htmlFor="skills"
        hint="Comma separated, e.g. React, SQL, Financial Modeling"
      >
        <Textarea id="skills" name="skills" rows={2} />
      </Field>

      <Field
        label="Attach your CV"
        htmlFor="cv"
        required
        error={errors.cv}
        hint="PDF, DOC, or DOCX — up to 8 MB"
      >
        <label
          htmlFor="cv"
          className="flex cursor-pointer items-center justify-between gap-3 rounded-sm border border-dashed border-ink-200 bg-white px-4 py-4 text-sm text-ink-500 transition-colors hover:border-brass-400 hover:bg-brass-50/40"
        >
          <span className="flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-brass-600" aria-hidden />
            {fileName || "Choose a file to upload"}
          </span>
          <span className="text-xs text-ink-300">Browse</span>
        </label>
        <input
          ref={fileInputRef}
          id="cv"
          name="cv"
          type="file"
          accept={ACCEPTED_FILE_EXTENSIONS}
          required
          className="sr-only"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
        />
      </Field>

      {formError && (
        <p role="alert" className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <Button type="submit" disabled={submitting} className="self-start">
        {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {submitting ? "Submitting..." : "Submit my CV"}
      </Button>

      <p className="text-xs leading-relaxed text-ink-400">
        By submitting, you agree that your details and CV may be shared with
        prospective employers for roles that match your profile.
      </p>
    </form>
  );
}
