// Suggested domains shown in the dropdowns. This list is only a starting
// point for convenience -- the filter on the dashboard is always built from
// whatever domain values actually exist in the database, so a candidate can
// type a domain that isn't in this list and it will still show up correctly.
export const SUGGESTED_DOMAINS = [
  "Information Technology",
  "Software Engineering",
  "Data & Analytics",
  "Human Resources",
  "Finance & Accounting",
  "Banking & Financial Services",
  "Sales & Business Development",
  "Marketing & Communications",
  "Customer Experience / Operations",
  "Project Management",
  "Legal & Compliance",
  "Engineering (Non-IT)",
  "Supply Chain & Logistics",
  "Administration",
  "Other",
];

export const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

// The limit the form enforces before uploading. Vercel rejects request bodies
// over about 4.5 MB, so anything bigger never reaches the server check above.
// Raise this to match MAX_FILE_SIZE_BYTES once uploads go straight to Blob.
export const FORM_MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB

export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const ACCEPTED_FILE_EXTENSIONS = ".pdf,.doc,.docx";
