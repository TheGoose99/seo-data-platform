/**
 * Test/demo Cal.com-shaped data for local runs and `--dry-run`.
 * Production values load from Supabase per client; never commit real API keys here.
 *
 * For DB-backed tests, `CAL_SEED_CLIENT_ID` + `supabase/seeds/test_client_cal.sql` use the same values.
 */
import type { CalComSlugTriple } from '../cal-types'

export const MOCK_CAL_INTEGRATIONS = {
  calComUsername: 'gabu-iieqyx',
  calComCanonicalEventSlugs: {
    initial: '30min',
    session: '30min',
    couple: '30min',
  } satisfies CalComSlugTriple,
  calComEventSlugs: {
    initial: '30min',
    session: '30min',
    couple: '30min',
  } satisfies CalComSlugTriple,
} as const

/** Seed service ids → which mock Cal slot maps to `calComEventSlugs` */
export const MOCK_SERVICE_ID_CAL_SLOT: Record<
  string,
  keyof typeof MOCK_CAL_INTEGRATIONS.calComEventSlugs
> = {
  s0: 'initial',
  s1: 'session',
  s2: 'couple',
}
