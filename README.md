# BK Talent Registry

A small web portal for **Bilal Kazmi (BK)** to collect CVs from candidates
and to search / filter / export them from a private admin dashboard instead
of managing everything over WhatsApp and email.

- **Landing page (`/`)** — two clearly separated entry points: "I'm a
  candidate" and "I'm BK (admin)".
- **Candidate form (`/apply`)** — anyone can submit their name, contact
  details, field/domain, experience, and upload their CV (PDF/DOC/DOCX).
- **Admin dashboard (`/admin` → `/admin/dashboard`)** — password-protected.
  Search and filter CVs by domain (e.g. "IT", "Finance"), select multiple
  candidates, and export either:
  - a **CSV** of their details, or
  - a **ZIP** containing the actual CV files plus a manifest CSV,
  ready to forward to a company.

## Tech stack

- **Next.js 14** (App Router, TypeScript) — deployed on **Vercel**
- **Neon** (serverless Postgres) via **Prisma**
- **Vercel Blob (private store)** for storing the uploaded CV files
- Plain cookie-based admin session (no third-party auth needed)

CVs contain personal details, so files are stored in a **private** Blob
store. Private blobs aren't reachable by their raw URL — the app serves
them through an authenticated route (`/api/cvs/[id]/file`) that only works
when signed in as admin.

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
| `BLOB_READ_WRITE_TOKEN` | Vercel dashboard → Storage → your Blob store → `.env.local` tab |
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

- Landing page: http://localhost:3000
- Candidate form: http://localhost:3000/apply
- Admin login: http://localhost:3000/admin

## 2. Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Add New Project** → import the repo.
3. Create a **Neon** Postgres database (Vercel's Storage tab has a Neon
   integration, or create one directly at neon.tech) and copy the
   **pooled** and **direct** connection strings into `DATABASE_URL` and
   `DIRECT_URL` in the Vercel project's Environment Variables.
4. In the Vercel project's **Storage** tab, create a **Blob** store
   (either access mode works — the app always uploads and reads with
   `access: "private"`, matching a private store; see the troubleshooting
   note below if you already created a public one) and connect it — this
   adds `BLOB_READ_WRITE_TOKEN` to your environment variables.
5. Add `ADMIN_PASSWORD` and `SESSION_SECRET` as environment variables too.
6. Deploy. On the first deploy, run the schema push once against the
   production database (from your machine, with the production
   `DATABASE_URL`/`DIRECT_URL` in `.env`):

   ```bash
   npm run db:push
   ```

That's it — the landing page, candidate form, and `/admin` dashboard will
be live on your Vercel URL.

### Troubleshooting: "Cannot use public/private access on a ... store"

Vercel Blob stores are locked to one access mode (public or private) at
creation and **cannot be switched later**. The app's code always uploads
and reads with `access: "private"`. If you see this error, your store's
access mode doesn't match:

- If your store is **private** (the current Vercel default) — nothing to
  do, the code already matches it.
- If your store is **public** — either delete it and create a new store
  choosing private access, or reconnect that store; you cannot toggle an
  existing store's mode. There is no need to change any code either way,
  as long as the store you connect is private.

## 3. How the pieces fit together

```
src/app/page.tsx               Landing page — links to /apply and /admin
src/app/apply/page.tsx         Candidate CV upload page
src/app/thank-you/page.tsx     Confirmation page after submitting
src/app/admin/page.tsx         Admin login
src/app/admin/dashboard/       Admin dashboard (search, filter, export, delete)
src/app/api/cvs/               POST = submit a CV (public), GET = list CVs (admin only)
src/app/api/cvs/[id]/          DELETE a CV (admin only)
src/app/api/cvs/[id]/file/     Streams one CV file from private Blob storage (admin only)
src/app/api/domains/           Returns the list of domains for the filter/dropdown
src/app/api/admin/login/       Checks ADMIN_PASSWORD, sets a signed session cookie
src/app/api/admin/logout/      Clears the session cookie
src/app/api/admin/export/      Bundles selected CVs into a CSV or a ZIP
src/middleware.ts              Blocks /admin/dashboard and the admin APIs
                                unless a valid session cookie is present
prisma/schema.prisma           The CV table definition
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
  reference to their file, which keeps the free-tier Neon database small.
