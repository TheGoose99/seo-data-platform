-- Per-client Cal.com: public fields on `clients`; secrets in `client_cal_secrets`.
-- Secrets are never exposed to RLS-authenticated users; only service_role bypasses RLS.

alter table public.clients
  add column if not exists cal_com_username text,
  add column if not exists cal_com_canonical_event_slugs jsonb,
  add column if not exists cal_com_event_slugs jsonb;

comment on column public.clients.cal_com_username is 'Cal.com username (public booking embeds).';
comment on column public.clients.cal_com_canonical_event_slugs is 'Canonical event type slugs for automation (JSON object).';
comment on column public.clients.cal_com_event_slugs is 'Bookable event slugs on the Cal account (JSON object).';

create table if not exists public.client_cal_secrets (
  client_id uuid primary key references public.clients(id) on delete cascade,
  cal_api_key text,
  cal_webhook_secret text,
  updated_at timestamptz not null default now()
);

comment on table public.client_cal_secrets is 'Sensitive Cal.com credentials; use service_role only. Never ship to merged-client.json.';

alter table public.client_cal_secrets enable row level security;

-- Intentionally no policies: deny all for anon/authenticated; service_role bypasses RLS.
