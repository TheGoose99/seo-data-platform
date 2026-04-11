-- Align public Cal fields on the test client with `lib/website/mocks/cal-integration.mock.ts`
-- (same values as the mock bundle used when `--client-id` is omitted).
--
-- Prerequisites: row `public.clients.id = '1f2865c5-6bec-41fc-9980-a229e5aba473'` exists (migration 0006 applied).
-- Run in Supabase SQL Editor (or psql) against your project.

update public.clients
set
  cal_com_username = '__MOCK_CAL_USER__',
  cal_com_canonical_event_slugs =
    '{"initial":"consultatie-initiala","session":"sedinta-individuala","couple":"terapie-cuplu"}'::jsonb,
  cal_com_event_slugs = '{"initial":"15min","session":"30min","couple":"30min"}'::jsonb
where id = '1f2865c5-6bec-41fc-9980-a229e5aba473';
