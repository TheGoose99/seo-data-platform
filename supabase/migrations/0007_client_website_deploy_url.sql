-- Latest deployed marketing site URL (e.g. Vercel preview or production) from onboarding.

alter table public.clients
  add column if not exists website_deploy_url text;

comment on column public.clients.website_deploy_url is 'URL from the latest website onboarding deploy (e.g. Vercel *.vercel.app preview or production).';
