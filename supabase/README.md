## Supabase (DB schema + policies)

This project uses Supabase Postgres with a **dedupe-first** schema and **tenant isolation** (RLS-ready).

### Apply migrations

For v0.1 (no Supabase CLI required), run the SQL in:

- `supabase/migrations/0001_init.sql`
- `supabase/migrations/0002_rls_helpers_security_definer.sql`
- `supabase/migrations/0003_job_runs_add_skipped_status.sql`
- …through `0007_client_website_deploy_url.sql` (includes `0006_client_cal_supabase.sql`: Cal columns + `client_cal_secrets`; plus `clients.website_deploy_url` for Vercel deploy URL from onboarding)

Apply it in the Supabase Dashboard:

- **SQL Editor** → paste contents → Run

If you run into `"Could not find the table 'public.organizations' in the schema cache"` from the API right after applying SQL:

- In Supabase Dashboard, go to **Settings → API → Reload schema** (or wait briefly for PostgREST schema cache to refresh)

After adding new columns (e.g. migration `0006`), reload the schema the same way if PostgREST omits them briefly.

### Cal.com (migration `0006`)

**Public fields** live on `public.clients`:

- `cal_com_username` — Cal.com username for embeds (non-secret).
- `cal_com_canonical_event_slugs` — JSON object with keys `initial`, `session`, `couple` (automation / canonical slugs).
- `cal_com_event_slugs` — JSON object with the same three keys (bookable event slugs). Website generation maps these to `services[].calEventSlug` for ids `s0`–`s2` when present.

**Secrets** live in `public.client_cal_secrets` (`cal_api_key`, `cal_webhook_secret`). That table has **RLS enabled and no policies**, so only the **service role** (or Postgres superuser) can read or write it. **Never** copy these into `merged-client.json` or static exports; use them only in server routes (webhooks, Cal API).

Example: set public Cal fields for one client (replace the UUID):

```sql
update public.clients
set
  cal_com_username = 'gabu-iieqyx',
  cal_com_canonical_event_slugs = '{"initial":"30min","session":"30min","couple":"30min"}'::jsonb,
  cal_com_event_slugs = '{"initial":"30min","session":"30min","couple":"30min"}'::jsonb
where id = '00000000-0000-0000-0000-000000000000';
```

Store `cal_api_key` and `cal_webhook_secret` only in `client_cal_secrets` via trusted server code or SQL executed with privileges that respect your security model; never paste them into `.env` as per-client values or into static site bundles.

**Website onboarding** loads public Cal into the merged JSON when you pass `--client-id=<uuid>` to `run-with-toon` / `onboard:client` (requires `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`). Without `--client-id`, the pipeline uses the mock Cal bundle instead.

**Test client (fixed id):** `lib/website/cal-seed-client-id.ts` exports `CAL_SEED_CLIENT_ID` (`1f2865c5-6bec-41fc-9980-a229e5aba473`). Run `supabase/seeds/test_client_cal.sql` once that row exists to set public Cal columns to the same values as the mock bundle; `tests/merge-client-cal.test.mjs` asserts the row matches `tests/fixtures/test-client-cal-expected.json`.

### Notes

- RLS policies are included but ingestion is expected to run server-side with the **Service Role** key (bypasses RLS).
- Do not store secrets in plaintext in DB. OAuth refresh tokens are stored **encrypted** (app-level encryption).

### Quick smoke test (service role)

If your `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, you can run:

```bash
node --env-file=.env.local --test tests/idempotency.test.js tests/merge-client-cal.test.mjs
```

