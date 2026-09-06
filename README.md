# BK Talent Registry

A small web portal for **Bilal Kazmi (BK)** to collect CVs from candidates
through a public upload form, and to search / filter / export them from a
private admin dashboard instead of managing everything over WhatsApp and
email.

- **Public page (`/`)** — anyone can submit their name, contact details,
  field/domain, experience, and upload their CV (PDF/DOC/DOCX).
- **Admin dashboard (`/admin`)** — password-protected. Search and filter
  CVs by domain (e.g. "IT", "Finance"), select multiple candidates, and
  export either:
  - a **CSV** of their details, or
  - a **ZIP** containing the actual CV files plus a manifest CSV,
  ready to forward to a company.

## Tech stack

- **Next.js 14** (App Router, TypeScript) — deployed on **Vercel**
- **Neon** (serverless Postgres) via **Prisma**
- **Vercel Blob** for storing the uploaded CV files
- Plain cookie-based admin session (no third-party auth needed)

## 1. Local setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon dashboard → your project → **Connection string** (pooled) |
| `DIRECT_URL` | Neon dashboard → **Connection string** (direct, non-pooled) — used for schema pushes |
| `BLOB_READ_WRITE_TOKEN` | Vercel dashboard → Storage → **Create a Blob store** → `.env.local` tab |
| `ADMIN_PASSWORD` | Any strong password BK will use to sign in to `/admin` |
| `SESSION_SECRET` | A random string, e.g. output of `openssl rand -base64 32` |

Push the schema to your Neon database:

```bash
npm run db:push
```

Run the app:

```bash
npm run dev
```

- Public form: http://localhost:3000
- Admin login: http://localhost:3000/admin

## 2. Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Add New Project** → import the repo.
3. Create a **Neon** Postgres database (Vercel's Storage tab has a Neon
   integration, or create one directly at neon.tech) and copy the
   **pooled** and **direct** connection strings into `DATABASE_URL` and
   `DIRECT_URL` in the Vercel project's Environment Variables.
4. In the Vercel project's **Storage** tab, create a **Blob** store and
   connect it — this automatically adds `BLOB_READ_WRITE_TOKEN` to your
   environment variables.
5. Add `ADMIN_PASSWORD` and `SESSION_SECRET` as environment variables too.
6. Deploy. On the first deploy, run the schema push once against the
   production database (from your machine, with the production
   `DATABASE_URL`/`DIRECT_URL` in `.env`):

   ```bash
   npm run db:push
   ```

That's it — the public form and `/admin` dashboard will be live on your
Vercel URL.

## 3. How the pieces fit together

```
src/app/page.tsx              Public CV upload page
src/app/thank-you/page.tsx    Confirmation page after submitting
src/app/admin/page.tsx        Admin login
src/app/admin/dashboard/      Admin dashboard (search, filter, export, delete)
src/app/api/cvs/              POST = submit a CV (public), GET = list CVs (admin only)
src/app/api/cvs/[id]/         DELETE a CV (admin only)
src/app/api/domains/          Returns the list of domains for the filter/dropdown
src/app/api/admin/login/      Checks ADMIN_PASSWORD, sets a signed session cookie
src/app/api/admin/logout/     Clears the session cookie
src/app/api/admin/export/     Bundles selected CVs into a CSV or a ZIP
src/middleware.ts             Blocks /admin/dashboard and the admin APIs
                               unless a valid session cookie is present
prisma/schema.prisma          The CV table definition
```

## 4. Notes

- **Domains/fields are free text with suggestions.** BK doesn't need to
  predefine every possible field — candidates can pick from a suggested
  list (IT, Finance, HR, ...) or type their own, and the admin filter
  dropdown automatically shows whatever domains actually exist in the
  database.
- **File size limit** is 8 MB per CV (adjust `MAX_FILE_SIZE_BYTES` in
  `src/lib/constants.ts` if needed).
- **Changing the admin password** just means updating the
  `ADMIN_PASSWORD` environment variable in Vercel and redeploying — there
  is no user table to manage.
- The CV files themselves live in Vercel Blob storage, not in the
  database — the database only stores each candidate's details and a
  link to their file, which keeps the free-tier Neon database small.
