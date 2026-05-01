type UpstashResult<T> = { result: T }

const LOCK_TTL_SECONDS = 24 * 60 * 60

function getRedisConfig() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url) throw new Error('Missing KV_REST_API_URL (or UPSTASH_REDIS_REST_URL)')
  if (!token) throw new Error('Missing KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_TOKEN)')
  return { url: url.replace(/\/+$/, ''), token }
}

function normalizePhone(raw: string): string {
  const trimmed = String(raw ?? '').trim()
  if (!trimmed) return ''
  const cleaned = trimmed.replace(/[^\d+]/g, '')
  if (!cleaned) return ''
  if (cleaned.startsWith('00')) return `+${cleaned.slice(2)}`
  return cleaned
}

type PhoneLockRecord = {
  phone: string
  bookingUid: string
  clientSlug: string
  webpage: string
  createdAt: string
}

function normalizeClientSlug(raw: string): string {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

async function redisFetch<T>(
  path: string,
  init?: Omit<RequestInit, 'headers'> & { headers?: Record<string, string> },
): Promise<T> {
  const { url, token } = getRedisConfig()
  const response = await fetch(`${url}${path}`, {
    method: init?.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    body: init?.body,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Upstash request failed (${response.status}): ${text}`)
  }

  return (await response.json()) as T
}

export function phoneLockKey(rawPhone: string): string {
  const phone = normalizePhone(rawPhone)
  if (!phone) throw new Error('phoneLockKey: phone is required')
  return `lock:phone:${phone}`
}

export async function redisGet(key: string): Promise<string | null> {
  if (!key) throw new Error('redisGet: key is required')
  const data = await redisFetch<UpstashResult<string | null>>(`/get/${encodeURIComponent(key)}`)
  return data.result ?? null
}

export async function redisDel(key: string): Promise<number> {
  if (!key) throw new Error('redisDel: key is required')
  const data = await redisFetch<UpstashResult<number>>(`/del/${encodeURIComponent(key)}`)
  return Number(data.result ?? 0)
}

export async function redisSetIfNotExists(key: string, value: unknown, ttlSeconds: number): Promise<boolean> {
  if (!key) throw new Error('redisSetIfNotExists: key is required')
  if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
    throw new Error('redisSetIfNotExists: ttlSeconds must be > 0')
  }
  const val = typeof value === 'string' ? value : JSON.stringify(value)
  const path = `/set/${encodeURIComponent(key)}/${encodeURIComponent(val)}/NX/EX/${encodeURIComponent(String(ttlSeconds))}`
  const data = await redisFetch<UpstashResult<string | null>>(path)
  return data.result === 'OK'
}

export async function checkAndLock(rawPhone: string, ttlSeconds = LOCK_TTL_SECONDS): Promise<{ allowed: boolean; key: string }> {
  const key = phoneLockKey(rawPhone)
  const allowed = await redisSetIfNotExists(
    key,
    {
      createdAt: new Date().toISOString(),
      source: 'seo-data-platform',
    },
    ttlSeconds,
  )
  return { allowed, key }
}

export async function deletePhoneLock(rawPhone: string): Promise<number> {
  const key = phoneLockKey(rawPhone)
  return redisDel(key)
}

export async function markIdempotent(key: string, ttlSeconds: number): Promise<boolean> {
  return redisSetIfNotExists(key, { at: new Date().toISOString() }, ttlSeconds)
}

export function phoneBookingLockKey(rawPhone: string, rawClientSlug: string): string {
  const phone = normalizePhone(rawPhone)
  const clientSlug = normalizeClientSlug(rawClientSlug)
  if (!phone) throw new Error('phoneBookingLockKey: phone is required')
  if (!clientSlug) throw new Error('phoneBookingLockKey: clientSlug is required')
  return `booking:lock:phone:${clientSlug}:${phone}`
}

export async function setPhoneBookingLock(rawPhone: string, bookingUid: string, webpage: string, rawClientSlug: string): Promise<void> {
  const normalizedPhone = normalizePhone(rawPhone)
  const clientSlug = normalizeClientSlug(rawClientSlug)
  if (!normalizedPhone) throw new Error('setPhoneBookingLock: phone is required')
  if (!bookingUid) throw new Error('setPhoneBookingLock: bookingUid is required')
  if (!clientSlug) throw new Error('setPhoneBookingLock: clientSlug is required')

  const key = phoneBookingLockKey(normalizedPhone, clientSlug)
  const value: PhoneLockRecord = {
    phone: normalizedPhone,
    bookingUid,
    clientSlug,
    webpage: webpage || 'closeby-demo-project',
    createdAt: new Date().toISOString(),
  }
  const val = JSON.stringify(value)
  const path = `/set/${encodeURIComponent(key)}/${encodeURIComponent(val)}/EX/${encodeURIComponent(String(LOCK_TTL_SECONDS))}`
  await redisFetch<UpstashResult<string | null>>(path)
}

export async function getPhoneBookingLock(rawPhone: string, rawClientSlug: string): Promise<PhoneLockRecord | null> {
  const normalizedPhone = normalizePhone(rawPhone)
  const clientSlug = normalizeClientSlug(rawClientSlug)
  if (!normalizedPhone) return null
  if (!clientSlug) return null
  const key = phoneBookingLockKey(normalizedPhone, clientSlug)
  const raw = await redisGet(key)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<PhoneLockRecord>
    if (
      typeof parsed.phone !== 'string' ||
      typeof parsed.bookingUid !== 'string' ||
      typeof parsed.clientSlug !== 'string' ||
      typeof parsed.webpage !== 'string' ||
      typeof parsed.createdAt !== 'string'
    ) {
      return null
    }
    return {
      phone: parsed.phone,
      bookingUid: parsed.bookingUid,
      clientSlug: parsed.clientSlug,
      webpage: parsed.webpage,
      createdAt: parsed.createdAt,
    }
  } catch {
    return null
  }
}

