/**
 * Push client env vars to a Vercel project (REST POST /v10/projects/{id}/env).
 * Mirrors closeby-demo-style config: Cal, Resend, Redis/KV, QStash, public site URL, CLIENT_SLUG.
 * Values come from process.env (load .env.local in onboard-client before running the pipeline).
 */

/** @type {string[]} Keys copied when present in process.env (non-empty). */
export const DEFAULT_VERCEL_SYNC_ENV_KEYS = [
  'CAL_API_KEY',
  'CAL_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'RESEND_FROM',
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'QSTASH_TOKEN',
  'QSTASH_FORWARD_SECRET',
]

function teamQueryParams(teamScope) {
  const params = new URLSearchParams()
  if (teamScope.startsWith('team_')) {
    params.set('teamId', teamScope)
  } else if (teamScope) {
    params.set('slug', teamScope)
  }
  return params
}

/**
 * @param {string} key
 * @returns {'encrypted' | 'plain'}
 */
function envVarType(key) {
  if (key.startsWith('NEXT_PUBLIC_')) return 'plain'
  return 'encrypted'
}

/**
 * @param {{ vercelToken: string; teamScope: string; projectId: string; items: { key: string; value: string }[] }} opts
 * @returns {Promise<{ ok: true; created: number } | { ok: false; error: string; status?: number }>}
 */
export async function applyEnvVarsToVercelProject(opts) {
  const { vercelToken, teamScope, projectId, items } = opts
  if (items.length === 0) {
    return { ok: true, created: 0 }
  }

  const params = teamQueryParams(teamScope)
  params.set('upsert', 'true')

  const target = ['production', 'preview', 'development']
  const body = items.map(({ key, value }) => ({
    key,
    value: String(value),
    type: envVarType(key),
    target,
  }))

  const url = `https://api.vercel.com/v10/projects/${encodeURIComponent(projectId)}/env?${params.toString()}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${vercelToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    return {
      ok: false,
      error: `Vercel env API invalid JSON (${res.status}): ${text.slice(0, 400)}`,
      status: res.status,
    }
  }

  if (!res.ok) {
    const msg = data.error?.message || data.message || text
    return { ok: false, error: `Vercel create env ${res.status}: ${msg}`, status: res.status }
  }

  const created = Array.isArray(data) ? data.length : items.length
  return { ok: true, created }
}

/**
 * Normalize deploy URL for NEXT_PUBLIC_SITE_URL (https, no trailing slash).
 * @param {string} u
 */
export function normalizeSiteUrl(u) {
  let s = String(u).trim()
  if (!s) return ''
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`
  return s.replace(/\/+$/, '')
}

/**
 * Build env entries: synced keys from process.env plus CLIENT_SLUG and NEXT_PUBLIC_SITE_URL.
 *
 * @param {NodeJS.ProcessEnv} env
 * @param {{ clientSlug: string; deployUrl: string | null; extraKeys?: string[] }} opts
 * @returns {{ key: string; value: string }[]}
 */
export function collectClientEnvEntries(env, opts) {
  const { clientSlug, deployUrl, extraKeys = [] } = opts
  const keys = new Set([
    ...DEFAULT_VERCEL_SYNC_ENV_KEYS,
    ...extraKeys.map((k) => k.trim()).filter(Boolean),
  ])

  const extraFromEnv = env.VERCEL_SYNC_EXTRA_KEYS?.split(/[\s,]+/).filter(Boolean) ?? []
  for (const k of extraFromEnv) keys.add(k)

  /** @type {{ key: string; value: string }[]} */
  const items = []

  const reserved = new Set(['CLIENT_SLUG', 'NEXT_PUBLIC_SITE_URL'])
  for (const key of keys) {
    if (reserved.has(key)) continue
    const v = env[key]
    if (v === undefined || String(v).length === 0) continue
    items.push({ key, value: String(v) })
  }

  items.push({ key: 'CLIENT_SLUG', value: clientSlug })

  const site = deployUrl ? normalizeSiteUrl(deployUrl) : normalizeSiteUrl(env.NEXT_PUBLIC_SITE_URL || '')
  if (site) {
    items.push({ key: 'NEXT_PUBLIC_SITE_URL', value: site })
  }

  return dedupeEnvEntries(items)
}

/**
 * Last occurrence wins (CLIENT_SLUG / NEXT_PUBLIC set after synced keys).
 * @param {{ key: string; value: string }[]} items
 */
export function dedupeEnvEntries(items) {
  const m = new Map()
  for (const { key, value } of items) {
    m.set(key, value)
  }
  return [...m.entries()].map(([key, value]) => ({ key, value: String(value) }))
}
