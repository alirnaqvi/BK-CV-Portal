// Everything about Bilal and the registry that appears as text on the site
// lives here, so it can be edited in one place without touching the pages.

export const SITE = {
  name: "BK Talent Registry",
  shortName: "BK",

  owner: {
    name: "Bilal Kazmi",
    firstName: "Bilal",
    // One line under his name. Edit this to match his current LinkedIn headline.
    headline: "HR and talent acquisition professional",
    // A short paragraph in his voice or about him. Keep it to facts he's happy
    // to have public.
    bio: "Bilal hires for companies across banking, fintech and technology. He keeps this registry so that when a role opens, he already knows who to call.",
    linkedin: "https://www.linkedin.com/in/muhammadbillalkazmi/",
    // Optional: put a square photo in /public (for example /public/bilal.jpg)
    // and set this to "/bilal.jpg". Leave empty to show the BK monogram.
    photo: "",
  },

  // Where candidates write to have their details corrected or removed.
  // Leave empty to point them to LinkedIn instead.
  contactEmail: "",

  // Used for link previews (LinkedIn, WhatsApp). Change it if the site moves
  // to a custom domain.
  url: "https://bk-cv-portal.vercel.app",

  description:
    "Send your CV to Bilal Kazmi once. It stays on file and is considered whenever a role in your field opens.",
} as const;

// Fields shown as quick picks on the landing page and at the top of the form.
// Each must match an entry in SUGGESTED_DOMAINS so the admin filter stays tidy.
export const FEATURED_DOMAINS = [
  "Information Technology",
  "Software Engineering",
  "Data & Analytics",
  "Banking & Financial Services",
  "Finance & Accounting",
  "Human Resources",
  "Sales & Business Development",
  "Marketing & Communications",
  "Customer Experience / Operations",
  "Project Management",
] as const;
