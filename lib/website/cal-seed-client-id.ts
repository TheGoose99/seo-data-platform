/**
 * Fixed `public.clients.id` for Cal seed SQL + integration tests (`tests/merge-client-cal.test.mjs`).
 * Public columns match `lib/website/mocks/cal-integration.mock.ts` after `supabase/seeds/test_client_cal.sql`.
 */
export const CAL_SEED_CLIENT_ID = '1f2865c5-6bec-41fc-9980-a229e5aba473' as const
