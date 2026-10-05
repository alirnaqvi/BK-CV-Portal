// Everything about Bilal and the registry that appears as text on the site
// lives here, so it can be edited in one place without touching the pages.

export const SITE = {
  name: "BK Talent Registry",
  shortName: "BK",

  owner: {
    name: "Bilal Kazmi",
    firstName: "Bilal",
    // One short line under his name (also shown on the link preview image).
    // His full LinkedIn headline is too long for this spot, so this is the
    // short version.
    headline: "HR Business Partner, Talent Development & Digital HR",
    // The sentence under the main headline on the landing page.
    intro:
      "Bilal Kazmi is an HR Business Partner with more than 18 years in financial services, fintech and technology. Add your CV to his registry and he'll have it to hand whenever a role in your field opens.",
    // "Who reads your CV" on the landing page. One paragraph per entry.
    bio: [
      "Bilal has spent more than 18 years in HR across financial services, fintech and technology, working with leadership teams on people strategy for fintech and digital banking.",
      "He builds leadership pipelines and management trainee programmes, leads digital HR and people analytics work, and champions inclusive workplaces, including opportunities for people with disabilities.",
    ],
    // Shown as tags under the bio. Taken from his LinkedIn "About" section.
    focus: [
      "Talent development",
      "Leadership pipelines",
      "Digital HR and people analytics",
      "Diversity, inclusion and accessibility",
      "Employee experience",
    ],
    linkedin: "https://www.linkedin.com/in/muhammadbillalkazmi/",
    // Optional: put a square photo in /public (for example /public/bilal.jpg)
    // and set this to "/bilal.jpg". Leave empty to show the BK monogram.
    photo: "/bilal.jpg",
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
