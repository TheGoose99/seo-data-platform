/**
 * After Claude merge: optionally apply **mock** Cal.com-shaped fields for tests/pipeline runs.
 *
 * - Set `MOCK_CAL_INTEGRATIONS=0` to skip (e.g. when merging public Cal fields from Supabase elsewhere).
 * - `cal_api_key` / `cal_webhook_secret` never belong here — they stay server-side in DB only.
 */
import type { CalComSlugTriple } from './cal-types'
import {
  MOCK_CAL_INTEGRATIONS,
  MOCK_SERVICE_ID_CAL_SLOT,
} from './mocks/cal-integration.mock'

type ServiceRow = { id?: string; calEventSlug?: string; [key: string]: unknown }

type ClientShape = {
  integrations?: Record<string, unknown>
  services?: ServiceRow[]
  layout?: Record<string, string>
  [key: string]: unknown
}

function mockCalIntegrationsEnabled(): boolean {
  return process.env.MOCK_CAL_INTEGRATIONS !== '0'
}

/**
 * Applies mock Cal username + slug maps and maps `services[].calEventSlug` for s0–s2.
 * No-op when `MOCK_CAL_INTEGRATIONS=0`.
 */
export function applyWebsiteBundleAfterMerge<T extends ClientShape>(client: T): T {
  if (!mockCalIntegrationsEnabled()) {
    return client
  }

  const out = structuredClone(client) as T
  const eventSlugs = {
    initial: MOCK_CAL_INTEGRATIONS.calComEventSlugs.initial,
    session: MOCK_CAL_INTEGRATIONS.calComEventSlugs.session,
    couple: MOCK_CAL_INTEGRATIONS.calComEventSlugs.couple,
  }

  const prev = (out.integrations ?? {}) as Record<string, unknown>
  out.integrations = {
    ...prev,
    calComUsername: MOCK_CAL_INTEGRATIONS.calComUsername,
    calComCanonicalEventSlugs: {
      ...MOCK_CAL_INTEGRATIONS.calComCanonicalEventSlugs,
      ...(typeof prev.calComCanonicalEventSlugs === 'object' &&
      prev.calComCanonicalEventSlugs !== null
        ? (prev.calComCanonicalEventSlugs as CalComSlugTriple)
        : {}),
    },
    calComEventSlugs: {
      ...MOCK_CAL_INTEGRATIONS.calComEventSlugs,
      ...(typeof prev.calComEventSlugs === 'object' && prev.calComEventSlugs !== null
        ? (prev.calComEventSlugs as CalComSlugTriple)
        : {}),
    },
  }

  if (Array.isArray(out.services)) {
    out.services = out.services.map((row) => {
      const id = row.id
      if (!id || !(id in MOCK_SERVICE_ID_CAL_SLOT)) return row
      const slot = MOCK_SERVICE_ID_CAL_SLOT[id]
      const slug = eventSlugs[slot]
      return { ...row, calEventSlug: slug }
    })
  }

  return out
}
