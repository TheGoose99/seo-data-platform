-- SEO Data Platform v0.1
-- Dedupe-first schema + portal-ready tenancy (org_id everywhere) + RLS

-- Extensions
create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────────────────────
-- Tenancy
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists org_memberships (
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- Helper functions for RLS
create or replace function public.is_org_member(org uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.org_memberships m
    where m.org_id = org
      and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(org uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.org_memberships m
    where m.org_id = org
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Clients & locations
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  client_slug text not null,
  display_name text not null,
  primary_domain text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, client_slug)
);

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,

  -- external identifiers (nullable, used for dedupe)
  gbp_location_id text,
  place_id text,

  -- address normalization fallback
  address_text text not null,
  address_hash text not null,

  -- canonical coordinates
  lat double precision,
  lng double precision,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists locations_org_gbp_location_id_uniq
  on locations(org_id, gbp_location_id)
  where gbp_location_id is not null;

create unique index if not exists locations_org_place_id_uniq
  on locations(org_id, place_id)
  where place_id is not null;

create unique index if not exists locations_org_address_hash_uniq
  on locations(org_id, address_hash);

-- ─────────────────────────────────────────────────────────────────────────────
-- Keywords
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists keywords (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,

  locale text not null default 'ro-RO',
  keyword_raw text not null,
  keyword_norm text not null,

  created_at timestamptz not null default now(),
  unique (org_id, client_id, locale, keyword_norm)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Grid specs + points
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists grid_specs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,

  shape text not null check (shape in ('square')),
  size int not null check (size in (3,5,7,9)),
  radius_m int not null check (radius_m > 0),
  step_m int not null check (step_m > 0),
  version int not null default 1,

  created_at timestamptz not null default now(),
  unique (location_id, shape, size, radius_m, step_m, version)
);

create table if not exists grid_points (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  grid_spec_id uuid not null references grid_specs(id) on delete cascade,

  point_index int not null check (point_index >= 0),
  lat double precision not null,
  lng double precision not null,
  geohash text,

  created_at timestamptz not null default now(),
  unique (grid_spec_id, point_index)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SERP entities (competitors) — org-scoped to avoid cross-tenant leakage
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists serp_entities (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  place_id text,
  name text not null,
  name_norm text not null,
  address_text text,
  address_hash text,
  website text,
  created_at timestamptz not null default now()
);

create unique index if not exists serp_entities_org_place_id_uniq
  on serp_entities(org_id, place_id)
  where place_id is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- Observations
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists serp_grid_observations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  keyword_id uuid not null references keywords(id) on delete cascade,
  grid_point_id uuid not null references grid_points(id) on delete cascade,

  provider text not null,
  observed_date date not null,

  rank int,
  top_entities jsonb, -- [{ entityId, rank, title?, rating?, reviewCount? }]
  raw_payload jsonb,

  created_at timestamptz not null default now(),
  unique (keyword_id, grid_point_id, observed_date, provider)
);

create table if not exists gbp_daily_metrics (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  metric_date date not null,

  views int,
  searches int,
  calls int,
  directions int,
  website_clicks int,

  created_at timestamptz not null default now(),
  unique (location_id, metric_date)
);

create table if not exists gsc_search_analytics_daily (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  metric_date date not null,

  query text not null,
  page text not null,
  device text not null,
  country text not null,

  clicks int not null,
  impressions int not null,
  ctr double precision not null,
  position double precision not null,

  created_at timestamptz not null default now(),
  unique (client_id, metric_date, query, page, device, country)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Observability
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists job_runs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  job_name text not null,
  status text not null check (status in ('running', 'success', 'failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  params jsonb not null default '{}'::jsonb,
  error text
);

create index if not exists job_runs_org_started_at_idx
  on job_runs(org_id, started_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- OAuth connections (encrypted refresh tokens)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists google_connections (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  created_by_user_id uuid not null,
  google_subject text not null,
  scopes text[] not null default '{}'::text[],
  encrypted_refresh_token text not null,
  created_at timestamptz not null default now(),
  unique (org_id, google_subject)
);

create table if not exists org_integrations (
  org_id uuid primary key references organizations(id) on delete cascade,
  gsc_site_url text,
  gbp_account_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS: tenant isolation (portal-ready)
-- ─────────────────────────────────────────────────────────────────────────────

alter table organizations enable row level security;
alter table org_memberships enable row level security;
alter table clients enable row level security;
alter table locations enable row level security;
alter table keywords enable row level security;
alter table grid_specs enable row level security;
alter table grid_points enable row level security;
alter table serp_entities enable row level security;
alter table serp_grid_observations enable row level security;
alter table gbp_daily_metrics enable row level security;
alter table gsc_search_analytics_daily enable row level security;
alter table job_runs enable row level security;
alter table google_connections enable row level security;
alter table org_integrations enable row level security;

-- Organizations: visible if you're a member
create policy organizations_select
on organizations
for select
using (public.is_org_member(id));

-- Memberships: visible if you're in org; write if org admin
create policy org_memberships_select
on org_memberships
for select
using (public.is_org_member(org_id));

create policy org_memberships_write_admin
on org_memberships
for all
using (public.is_org_admin(org_id))
with check (public.is_org_admin(org_id));

-- Generic org-scoped policies
create policy clients_select on clients
for select using (public.is_org_member(org_id));
create policy clients_write_admin on clients
for all using (public.is_org_admin(org_id)) with check (public.is_org_admin(org_id));

create policy locations_select on locations
for select using (public.is_org_member(org_id));
create policy locations_write_admin on locations
for all using (public.is_org_admin(org_id)) with check (public.is_org_admin(org_id));

create policy keywords_select on keywords
for select using (public.is_org_member(org_id));
create policy keywords_write_admin on keywords
for all using (public.is_org_admin(org_id)) with check (public.is_org_admin(org_id));

create policy grid_specs_select on grid_specs
for select using (public.is_org_member(org_id));
create policy grid_specs_write_admin on grid_specs
for all using (public.is_org_admin(org_id)) with check (public.is_org_admin(org_id));

create policy grid_points_select on grid_points
for select using (public.is_org_member(org_id));
create policy grid_points_write_admin on grid_points
for all using (public.is_org_admin(org_id)) with check (public.is_org_admin(org_id));

create policy serp_entities_select on serp_entities
for select using (public.is_org_member(org_id));
create policy serp_entities_write_admin on serp_entities
for all using (public.is_org_admin(org_id)) with check (public.is_org_admin(org_id));

create policy serp_grid_observations_select on serp_grid_observations
for select using (public.is_org_member(org_id));
create policy serp_grid_observations_write_admin on serp_grid_observations
for all using (public.is_org_admin(org_id)) with check (public.is_org_admin(org_id));

create policy gbp_daily_metrics_select on gbp_daily_metrics
for select using (public.is_org_member(org_id));
create policy gbp_daily_metrics_write_admin on gbp_daily_metrics
for all using (public.is_org_admin(org_id)) with check (public.is_org_admin(org_id));

create policy gsc_search_analytics_daily_select on gsc_search_analytics_daily
for select using (public.is_org_member(org_id));
create policy gsc_search_analytics_daily_write_admin on gsc_search_analytics_daily
for all using (public.is_org_admin(org_id)) with check (public.is_org_admin(org_id));

create policy job_runs_select on job_runs
for select using (public.is_org_member(org_id));
create policy job_runs_write_admin on job_runs
for all using (public.is_org_admin(org_id)) with check (public.is_org_admin(org_id));

create policy google_connections_select on google_connections
for select using (public.is_org_member(org_id));
create policy google_connections_write_admin on google_connections
for all using (public.is_org_admin(org_id)) with check (public.is_org_admin(org_id));

create policy org_integrations_select on org_integrations
for select using (public.is_org_member(org_id));
create policy org_integrations_write_admin on org_integrations
for all using (public.is_org_admin(org_id)) with check (public.is_org_admin(org_id));

