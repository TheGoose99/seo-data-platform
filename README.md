# SEO Data Platform

Internal **Local SEO** data platform: **GSC** + **Google Business Profile** + **SERP grid** (DataForSEO), with **org-scoped** data in **Supabase Postgres**, dedupe-first UPSERTs, and a minimal ops UI.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS v4
- **Supabase** (Auth + Postgres + RLS)
- **Google OAuth** (offline refresh tokens, encrypted at rest)
- **DataForSEO** (Maps / local grid)

## Local setup

1. **Install**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.local.example` → `.env.local` and fill values (never commit `.env.local`).

3. **Database**

   Apply the schema in the Supabase SQL editor:

   - [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   - Later migrations in order (e.g. [`0005_clients_one_per_org.sql`](supabase/migrations/0005_clients_one_per_org.sql)).

   **Migration 0005** adds a unique index on `clients(org_id)` (one client per organization). Apply it only when there are **no duplicate `org_id` rows** in `clients`; dedupe first or the migration will fail.

   See [`supabase/README.md`](supabase/README.md) for notes on RLS and the service role.

4. **Run**

   ```bash
   npm run dev
   ```

   Open `/login`, then `/app` → create an org (optional) → onboard a client → open the dashboard and run ingestion when APIs are configured.

## Deploy (Vercel)

- Production app: **https://seo-data-platform.vercel.app**
- Set the same variables as in `.env.local.example` in **Project → Settings → Environment Variables** (Production).  
  **Preview**-scoped env vars require a **connected Git repository** on Vercel.

## Scripts

| Command        | Purpose        |
| -------------- | -------------- |
| `npm run dev`  | Dev server     |
| `npm run build`| Production build |
| `npm run start`| Start production server |
| `npm run lint` | ESLint         |
| `npm test`     | Node test runner (`tests/`) |

## Development status (Phase 1)

**Done in code**

- Supabase schema + RLS + `job_runs`, `google_connections`, `org_integrations`
- Supabase SSR helpers + `proxy.ts` session refresh
- Google OAuth connect (`/api/auth/google/*`)
- Ingestion jobs: GSC daily, GBP daily, SERP grid (DataForSEO), default **last 3 days**, UPSERT + job run rows
- UI: login, org list/create, client onboarding, dashboard (heatmap + trend snippets + job runs + “Run ingest”)

**You still configure per tenant / Google**

- `org_integrations.gsc_site_url` (GSC property URL)
- `locations.gbp_location_id` for GBP Performance API
- Google Cloud: APIs enabled, OAuth client, redirect URI  
  `https://seo-data-platform.vercel.app/api/auth/google/callback` (or your custom domain)

**Known follow-ups**

- Consider migrating the session refresh logic from `proxy.ts` into route-level auth checks as the app matures (Proxy should be a last resort).
- SERP parsing assumes DataForSEO Maps payload shape; adjust if your account returns different `items` types.

## Agent notes

See [`AGENTS.md`](AGENTS.md) for Next.js version caveats in this repo.
