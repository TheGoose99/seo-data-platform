import { Redis } from '@upstash/redis'

const LOCK_TTL_SECONDS = 24 * 60 * 60

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

function normalizeToE164(raw: string): string {
  const trimmed = String(raw ?? '').trim()
  if (!trimmed) return ''
  const cleaned = trimmed.replace(/[^\d+]/g, '')
  if (!cleaned) return ''
  if (cleaned.startsWith('+')) return cleaned
  if (cleaned.startsWith('00')) return `+${cleaned.slice(2)}`
  if (cleaned.startsWith('40') && cleaned.length === 11) return `+${cleaned}`
  if (cleaned.startsWith('0') && cleaned.length === 10) return `+4${cleaned}`
  return ''
}

export function phoneLockKey(rawPhone: string): string {
  const phone = normalizeToE164(rawPhone)
  if (!phone) throw new Error('phoneLockKey: phone is required')
  return `phone_lock:${phone}`
}

type PhoneLockValue = {
  phone: string
  bookingUid: string
  webpage: string
  createdAt: string
}

export async function lockPhone(phone: string, bookingUid: string): Promise<void> {
  const normalizedPhone = normalizeToE164(phone)
  if (!normalizedPhone) throw new Error('Invalid phone')
  const normalizedBookingUid = bookingUid.trim()
  if (!normalizedBookingUid) throw new Error('Invalid bookingUid')

  const value: PhoneLockValue = {
    phone: normalizedPhone,
    bookingUid: normalizedBookingUid,
    webpage: process.env.NEXT_PUBLIC_SITE_URL ?? '',
    createdAt: new Date().toISOString(),
  }
  await redis.set(phoneLockKey(normalizedPhone), value, { ex: LOCK_TTL_SECONDS })
}

export async function checkPhoneLock(phone: string): Promise<{ locked: true; createdAt: string } | { locked: false }> {
  const key = phoneLockKey(phone)
  const value = await redis.get<PhoneLockValue | null>(key)
  if (!value) return { locked: false }
  return { locked: true, createdAt: value.createdAt }
}

export async function redisGet(key: string): Promise<string | null> {
  if (!key) throw new Error('redisGet: key is required')
  const data = await redis.get<string | null>(key)
  return data ?? null
}

export async function redisDel(key: string): Promise<number> {
  if (!key) throw new Error('redisDel: key is required')
  const deleted = await redis.del(key)
  return Number(deleted ?? 0)
}

export async function redisSetIfNotExists(key: string, value: unknown, ttlSeconds: number): Promise<boolean> {
  if (!key) throw new Error('redisSetIfNotExists: key is required')
  if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
    throw new Error('redisSetIfNotExists: ttlSeconds must be > 0')
  }
  const result = await redis.set(key, value, { nx: true, ex: ttlSeconds })
  return result === 'OK'
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

