import { NextResponse } from 'next/server'
import type { BookingWorkerPayload } from '@/lib/booking-events'
import { isBookingWorkerPayload } from '@/lib/booking-events'
import { sendAcceptedWhatsApp, sendCancelledEmail, sendDeclinedWhatsApp, sendReminderWhatsApp } from '@/lib/notifications'
import { deletePhoneLock, markIdempotent } from '@/lib/redis'
import { getWorkerPublicUrl, qstashPublishJson } from '@/lib/qstash'

const WEBHOOK_EVENT_IDEMPOTENCY_TTL = 48 * 60 * 60
const NOTIFY_IDEMPOTENCY_TTL = 7 * 24 * 60 * 60

function isAuthorizedWorkerRequest(request: Request): boolean {
  const expected = process.env.QSTASH_FORWARD_SECRET?.trim()
  if (!expected) return true
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${expected}`
}

function reminderDelaySeconds(startIso: string): number {
  const start = new Date(startIso).getTime()
  if (!Number.isFinite(start)) return 0
  const ms = start - Date.now() - 24 * 60 * 60 * 1000
  return Math.max(0, Math.ceil(ms / 1000))
}

async function sendOnce(key: string, action: () => Promise<unknown>) {
  const firstTime = await markIdempotent(key, NOTIFY_IDEMPOTENCY_TTL)
  if (!firstTime) return { duplicate: true }
  await action()
  return { duplicate: false }
}

async function handleReminder(payload: BookingWorkerPayload) {
  await sendOnce(`notify:whatsapp:${payload.bookingId}:reminder24h`, async () => {
    await sendReminderWhatsApp(payload)
  })
}

async function handleAccepted(payload: BookingWorkerPayload) {
  await sendOnce(`notify:whatsapp:${payload.bookingId}:accepted`, async () => {
    await sendAcceptedWhatsApp(payload)
  })

  const delaySeconds = reminderDelaySeconds(payload.startTimeIso)
  if (delaySeconds <= 0) return

  const reminderPayload: BookingWorkerPayload = {
    ...payload,
    messageType: 'booking-reminder-24h',
    eventId: `${payload.eventId}:reminder24h`,
  }

  await qstashPublishJson({
    url: getWorkerPublicUrl('/api/qstash/worker'),
    body: reminderPayload,
    delaySeconds,
  })
}

async function handleRejected(payload: BookingWorkerPayload) {
  if (payload.attendeePhone) await deletePhoneLock(payload.attendeePhone)

  if (payload.attendeePhone) {
    await sendOnce(`notify:whatsapp:${payload.bookingId}:rejected`, async () => {
      await sendDeclinedWhatsApp(payload)
    })
  }
}

async function handleCancelled(payload: BookingWorkerPayload) {
  if (payload.attendeePhone) await deletePhoneLock(payload.attendeePhone)

  if (payload.attendeeEmail) {
    await sendOnce(`notify:email:${payload.bookingId}:cancelled`, async () => {
      await sendCancelledEmail(payload)
    })
  }
}

export async function POST(request: Request) {
  if (!isAuthorizedWorkerRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized worker caller' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!isBookingWorkerPayload(body)) {
    return NextResponse.json({ error: 'Invalid worker payload' }, { status: 400 })
  }

  const payload = body
  const dedupeKey =
    payload.messageType === 'booking-reminder-24h'
      ? `processed:webhook:reminder24h:${payload.bookingId}`
      : `processed:webhook:${payload.triggerEvent}:${payload.bookingId}`
  const firstEvent = await markIdempotent(dedupeKey, WEBHOOK_EVENT_IDEMPOTENCY_TTL)
  if (!firstEvent) return NextResponse.json({ ok: true, duplicate: true })

  if (payload.messageType === 'booking-reminder-24h') {
    await handleReminder(payload)
    return NextResponse.json({ ok: true, messageType: payload.messageType })
  }

  switch (payload.triggerEvent) {
    case 'BOOKING_ACCEPTED':
      await handleAccepted(payload)
      break
    case 'BOOKING_REJECTED':
      await handleRejected(payload)
      break
    case 'BOOKING_CANCELLED':
      await handleCancelled(payload)
      break
    default:
      break
  }

  return NextResponse.json({ ok: true, triggerEvent: payload.triggerEvent })
}

