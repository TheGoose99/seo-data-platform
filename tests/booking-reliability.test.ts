import test from 'node:test'
import assert from 'node:assert/strict'
import { checkAndLock, deletePhoneLock, phoneLockKey } from '@/lib/redis'
import { POST as workerPost } from '@/app/api/qstash/worker/route'

const REDIS_URL = 'https://redis.example.test'
const REDIS_TOKEN = 'redis-token'

type MockResponseInit = {
  status?: number
  json?: unknown
  text?: string
}

function mockJsonResponse(init: MockResponseInit = {}): Response {
  const status = init.status ?? 200
  const body = init.json ?? {}
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function installMockFetch() {
  const original = globalThis.fetch
  const redisStore = new Map<string, string>()
  const calls = {
    meta: 0,
    resend: 0,
    qstash: 0,
  }
  const metaBodies: unknown[] = []

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()

    if (url.startsWith(REDIS_URL)) {
      const parsed = new URL(url)
      const parts = parsed.pathname.split('/').filter(Boolean).map(decodeURIComponent)
      const action = parts[0]
      if (action === 'set') {
        const key = parts[1] ?? ''
        const value = parts[2] ?? ''
        if (redisStore.has(key)) return mockJsonResponse({ json: { result: null } })
        redisStore.set(key, value)
        return mockJsonResponse({ json: { result: 'OK' } })
      }
      if (action === 'del') {
        const key = parts[1] ?? ''
        const removed = redisStore.delete(key)
        return mockJsonResponse({ json: { result: removed ? 1 : 0 } })
      }
      if (action === 'get') {
        const key = parts[1] ?? ''
        return mockJsonResponse({ json: { result: redisStore.get(key) ?? null } })
      }
      return mockJsonResponse({ status: 400, json: { error: 'Unsupported redis action' } })
    }

    if (url.includes('graph.facebook.com')) {
      calls.meta += 1
      if (init?.body && typeof init.body === 'string') {
        try {
          metaBodies.push(JSON.parse(init.body))
        } catch {
          metaBodies.push(null)
        }
      }
      return mockJsonResponse({ json: { messages: [{ id: 'wamid.123' }] } })
    }

    if (url.includes('api.resend.com')) {
      calls.resend += 1
      return mockJsonResponse({ json: { id: 'email_123' } })
    }

    if (url.includes('qstash.upstash.io')) {
      calls.qstash += 1
      return mockJsonResponse({ json: { messageId: 'qstash_123' } })
    }

    return mockJsonResponse({ status: 404, text: 'Not Found' })
  }) as typeof fetch

  return {
    calls,
    metaBodies,
    restore() {
      globalThis.fetch = original
    },
  }
}

test('checkAndLock + deletePhoneLock enforce lock lifecycle', async (t) => {
  process.env.UPSTASH_REDIS_REST_URL = REDIS_URL
  process.env.UPSTASH_REDIS_REST_TOKEN = REDIS_TOKEN

  const mock = installMockFetch()
  t.after(() => mock.restore())

  const first = await checkAndLock('+40 712 000 000')
  assert.equal(first.allowed, true)

  const second = await checkAndLock('+40 712 000 000')
  assert.equal(second.allowed, false)

  const removed = await deletePhoneLock('+40 712 000 000')
  assert.equal(removed, 1)

  const third = await checkAndLock('+40 712 000 000')
  assert.equal(third.allowed, true)
  assert.equal(phoneLockKey('0040 712 000 000'), 'lock:phone:+40712000000')
})

test('worker handles accepted/rejected/cancelled with retry-safe idempotency', async (t) => {
  process.env.UPSTASH_REDIS_REST_URL = REDIS_URL
  process.env.UPSTASH_REDIS_REST_TOKEN = REDIS_TOKEN
  process.env.QSTASH_FORWARD_SECRET = 'worker-secret'
  process.env.QSTASH_TOKEN = 'qstash-token'
  process.env.NEXT_PUBLIC_SITE_URL = 'https://seo.example.test'
  process.env.META_WA_PHONE_NUMBER_ID = '1234567890'
  process.env.META_WA_ACCESS_TOKEN = 'meta-token'
  process.env.META_WA_TEMPLATE_LANG = 'ro'
  process.env.META_WA_TEST_USE_HELLO_WORLD = '1'
  process.env.META_WA_TEMPLATE_BODY_MODE = 'single'
  process.env.RESEND_API_KEY = 're_123'
  process.env.RESEND_FROM = 'noreply@example.test'

  const mock = installMockFetch()
  t.after(() => mock.restore())

  const basePayload = {
    messageType: 'cal-webhook-event' as const,
    eventId: 'BOOKING_ACCEPTED:uid-1',
    triggerEvent: 'BOOKING_ACCEPTED',
    bookingId: 'uid-1',
    attendeeName: 'Ana',
    attendeeEmail: 'ana@example.test',
    attendeePhone: '+40711111222',
    startTimeIso: '2030-01-02T10:00:00.000Z',
    endTimeIso: '2030-01-02T10:50:00.000Z',
    tenantSlug: 'demo',
    locationMapsLink: 'https://maps.google.com/?q=clinic',
  }

  const acceptedResponse = await workerPost(
    new Request('https://seo.example.test/api/qstash/worker', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer worker-secret',
      },
      body: JSON.stringify(basePayload),
    }),
  )
  assert.equal(acceptedResponse.status, 200)
  const acceptedJson = await acceptedResponse.json()
  assert.equal(acceptedJson.duplicate, undefined, JSON.stringify(acceptedJson))
  assert.equal(mock.calls.meta, 1)
  assert.equal(mock.calls.qstash, 1)
  const firstMeta = mock.metaBodies[0] as { template?: { name?: string } }
  assert.equal(firstMeta?.template?.name, 'hello_world')

  const duplicateResponse = await workerPost(
    new Request('https://seo.example.test/api/qstash/worker', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer worker-secret',
      },
      body: JSON.stringify(basePayload),
    }),
  )
  assert.equal(duplicateResponse.status, 200)
  assert.equal(mock.calls.meta, 1)

  const reminderResponse = await workerPost(
    new Request('https://seo.example.test/api/qstash/worker', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer worker-secret',
      },
      body: JSON.stringify({
        ...basePayload,
        messageType: 'booking-reminder-24h',
        eventId: `${basePayload.eventId}:reminder24h`,
      }),
    }),
  )
  assert.equal(reminderResponse.status, 200)
  const reminderJson = await reminderResponse.json()
  assert.equal(reminderJson.duplicate, undefined, JSON.stringify(reminderJson))
  assert.equal(mock.calls.meta, 2)
  const secondMeta = mock.metaBodies[1] as { template?: { name?: string } }
  assert.equal(secondMeta?.template?.name, 'hello_world')

  await checkAndLock(basePayload.attendeePhone)
  const rejectedResponse = await workerPost(
    new Request('https://seo.example.test/api/qstash/worker', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer worker-secret',
      },
      body: JSON.stringify({
        ...basePayload,
        eventId: 'BOOKING_REJECTED:uid-2',
        triggerEvent: 'BOOKING_REJECTED',
        bookingId: 'uid-2',
      }),
    }),
  )
  assert.equal(rejectedResponse.status, 200)
  const rejectedJson = await rejectedResponse.json()
  assert.equal(rejectedJson.duplicate, undefined, JSON.stringify(rejectedJson))
  assert.equal(mock.calls.meta, 3)
  assert.equal(mock.calls.resend, 0)
  const thirdMeta = mock.metaBodies[2] as { template?: { name?: string } }
  assert.equal(thirdMeta?.template?.name, 'hello_world')

  const relockAfterRejected = await checkAndLock(basePayload.attendeePhone)
  assert.equal(relockAfterRejected.allowed, true)

  await checkAndLock(basePayload.attendeePhone)
  const cancelledResponse = await workerPost(
    new Request('https://seo.example.test/api/qstash/worker', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer worker-secret',
      },
      body: JSON.stringify({
        ...basePayload,
        eventId: 'BOOKING_CANCELLED:uid-3',
        triggerEvent: 'BOOKING_CANCELLED',
        bookingId: 'uid-3',
      }),
    }),
  )
  assert.equal(cancelledResponse.status, 200)
  assert.equal(mock.calls.resend, 1)

  const relockAfterCancelled = await checkAndLock(basePayload.attendeePhone)
  assert.equal(relockAfterCancelled.allowed, true)
})

