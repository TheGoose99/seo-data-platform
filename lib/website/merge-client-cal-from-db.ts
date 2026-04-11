/**
 * Load **public** Cal.com fields from Supabase `clients` (service role).
 * Never selects `client_cal_secrets` — API keys and webhook secrets stay server-side only.
 */
import { createClient } from '@supabase/supabase-js'
import type { CalComSlugTriple } from './cal-types'
import { MOCK_SERVICE_ID_CAL_SLOT } from './mocks/cal-integration.mock'

type ServiceRow = { id?: string; calEventSlug?: string; [key: string]: unknown }

type ClientShape = {
  integrations?: Record<string, unknown>
  services?: ServiceRow[]
  [key: string]: unknown
}

function isCalTriple(v: unknown): v is CalComSlugTriple {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return (
    typeof o.initial === 'string' &&
    typeof o.session === 'string' &&
    typeof o.couple === 'string'
  )
}

export async function mergeClientCalPublicFromDb<T extends ClientShape>(
  client: T,
  clientId: string
): Promise<{ ok: true; merged: T } | { ok: false; error: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return {
      ok: false,
      error:
        'mergeClientCalPublicFromDb: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
    }
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supabase
    .from('clients')
    .select('cal_com_username, cal_com_canonical_event_slugs, cal_com_event_slugs')
    .eq('id', clientId)
    .maybeSingle()

  if (error) {
    return { ok: false, error: `mergeClientCalPublicFromDb: ${error.message}` }
  }
  if (!data) {
    return { ok: false, error: `mergeClientCalPublicFromDb: no client row for id ${clientId}` }
  }

  const hasUsername =
    data.cal_com_username != null && String(data.cal_com_username).trim() !== ''
  const hasCanon =
    data.cal_com_canonical_event_slugs != null &&
    isCalTriple(data.cal_com_canonical_event_slugs)
  const hasBookSlugs =
    data.cal_com_event_slugs != null && isCalTriple(data.cal_com_event_slugs)
  if (!hasUsername && !hasCanon && !hasBookSlugs) {
    console.warn(
      `mergeClientCalPublicFromDb: clients.id=${clientId} has no Cal public fields set (cal_com_* are null or invalid). ` +
        'Merged JSON keeps integrations from the LLM/seed step; populate Cal columns or omit --client-id to use the mock bundle.'
    )
  }

  const out = structuredClone(client) as T
  const prev = (out.integrations ?? {}) as Record<string, unknown>
  const nextIntegrations: Record<string, unknown> = { ...prev }

  if (data.cal_com_username != null && String(data.cal_com_username).trim() !== '') {
    nextIntegrations.calComUsername = data.cal_com_username
  }

  if (data.cal_com_canonical_event_slugs != null && isCalTriple(data.cal_com_canonical_event_slugs)) {
    nextIntegrations.calComCanonicalEventSlugs = {
      ...(typeof prev.calComCanonicalEventSlugs === 'object' &&
      prev.calComCanonicalEventSlugs !== null
        ? (prev.calComCanonicalEventSlugs as CalComSlugTriple)
        : {}),
      ...data.cal_com_canonical_event_slugs,
    }
  }

  if (data.cal_com_event_slugs != null && isCalTriple(data.cal_com_event_slugs)) {
    nextIntegrations.calComEventSlugs = {
      ...(typeof prev.calComEventSlugs === 'object' && prev.calComEventSlugs !== null
        ? (prev.calComEventSlugs as CalComSlugTriple)
        : {}),
      ...data.cal_com_event_slugs,
    }
  }

  out.integrations = nextIntegrations

  const slugs = data.cal_com_event_slugs
  if (isCalTriple(slugs) && Array.isArray(out.services)) {
    const eventSlugs = {
      initial: slugs.initial,
      session: slugs.session,
      couple: slugs.couple,
    }
    out.services = out.services.map((row) => {
      const id = row.id
      if (!id || !(id in MOCK_SERVICE_ID_CAL_SLOT)) return row
      const slot = MOCK_SERVICE_ID_CAL_SLOT[id]
      const slug = eventSlugs[slot]
      return { ...row, calEventSlug: slug }
    })
  }

  return { ok: true, merged: out }
}
