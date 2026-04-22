-- Onboarding intake persistence + pipeline state.
-- Stores raw intake payload (validated by Zod) and processing outputs.
-- NOTE: secrets must remain in dedicated tables (e.g. client_cal_secrets). Do not persist API keys in plaintext here.

create table if not exists public.onboarding_intakes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid,

  status text not null default 'received'
    check (status in ('received', 'validated', 'processing', 'done', 'failed')),

  payload jsonb not null,
  validation_errors jsonb,

  client_id uuid references public.clients(id) on delete set null,
  location_id uuid references public.locations(id) on delete set null,

  dataforseo_job_id text,
  claude_run_id text,
  github_repo text,
  vercel_project_id text,
  website_deploy_url text,

  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.onboarding_intakes is
  'Raw onboarding intake payload + pipeline state. Source-of-truth for the onboarding pipeline; do not store secrets here.';

create index if not exists onboarding_intakes_org_created_at_idx
  on public.onboarding_intakes (org_id, created_at desc);

create index if not exists onboarding_intakes_status_created_at_idx
  on public.onboarding_intakes (status, created_at desc);

alter table public.onboarding_intakes enable row level security;

-- Read allowed to any member; write allowed to org admins.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'onboarding_intakes'
      and policyname = 'onboarding_intakes_select_member'
  ) then
    create policy onboarding_intakes_select_member
      on public.onboarding_intakes
      for select
      using (public.is_org_member(org_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'onboarding_intakes'
      and policyname = 'onboarding_intakes_insert_admin'
  ) then
    create policy onboarding_intakes_insert_admin
      on public.onboarding_intakes
      for insert
      with check (public.is_org_admin(org_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'onboarding_intakes'
      and policyname = 'onboarding_intakes_update_admin'
  ) then
    create policy onboarding_intakes_update_admin
      on public.onboarding_intakes
      for update
      using (public.is_org_admin(org_id))
      with check (public.is_org_admin(org_id));
  end if;
end $$;

