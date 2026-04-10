-- At most one client row per organization (CloseBy product model: 1 org = 1 client).
-- Preconditions: no duplicate org_id in clients; dedupe manually before applying if migration fails.

create unique index if not exists clients_one_per_org
  on public.clients (org_id);

comment on index public.clients_one_per_org is
  'Ensures a single client record per org; onboarding must reject or update when a client already exists.';
