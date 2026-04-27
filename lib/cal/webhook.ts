import { createHmac, timingSafeEqual } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import type { BookingWorkerPayload } from '@/lib/booking-events'

type TenantSecretLookup = {
  tenantSlug: string
  webhookSecret: string
}

function timingSafeEqualHex(aHex: string, bHex: string): boolean {
  if (aHex.length !== bHex.length) return false
  const a = Buffer.from(aHex, 'hex')
  const b = Buffer.from(bHex, 'hex')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

function normalizePhone(raw: string): string {
  const trimmed = String(raw ?? '').trim()
  if (!trimmed) return ''
  const cleaned = trimmed.replace(/[^\d+]/g, '')
  if (!cleaned) return ''
  if (cleaned.startsWith('00')) return `+${cleaned.slice(2)}`
  return cleaned
}

function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function resolveCalWebhookSecretByPayload(body: unknown): Promise<TenantSecretLookup> {
  const fallbackSecret = process.env.CAL_WEBHOOK_SECRET?.trim() ?? ''
  const fallbackSlug =
    process.env.WEBHOOK_TENANT_CLIENT_SLUG?.trim() || process.env.SUPABASE_TENANT_CLIENT_SLUG?.trim() || 'default'
  const username = extractOrganizerUsername(body)

  const admin = getSupabaseAdminClient()
  if (!admin || !username) {
    return { tenantSlug: fallbackSlug, webhookSecret: fallbackSecret }
  }

  const { data: clientRow } = await admin
    .from('clients')
    .select('id, client_slug')
    .eq('cal_com_username', username)
    .maybeSingle()

  if (!clientRow?.id || !clientRow.client_slug) {
    return { tenantSlug: fallbackSlug, webhookSecret: fallbackSecret }
  }

  const { data: secretRow } = await admin
    .from('client_cal_secrets')
    .select('cal_webhook_secret')
    .eq('client_id', clientRow.id)
    .maybeSingle()

  const secret = secretRow?.cal_webhook_secret?.trim() || fallbackSecret
  return {
    tenantSlug: clientRow.client_slug,
    webhookSecret: secret,
  }
}

export function verifyCalSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  return timingSafeEqualHex(signature, expected)
}

export function verifyCalSharedSecretHeader(headerValue: string | null, secret: string): boolean {
  if (!headerValue || !secret) return false
  return headerValue.trim() === secret
}

export function buildWorkerPayload(body: unknown, tenantSlug: string): BookingWorkerPayload | null {
  const row = body as Record<string, unknown>
  const triggerEvent = String(row?.triggerEvent ?? '').trim()
  const payload = ((row?.payload as Record<string, unknown> | undefined) ??
    (row?.data as Record<string, unknown> | undefined) ??
    null)

  if (!triggerEvent || !payload) return null

  const bookingId = String(payload.uid ?? payload.bookingId ?? payload.id ?? '').trim()
  if (!bookingId) return null

  const attendees = Array.isArray(payload.attendees) ? payload.attendees : []
  const attendee = (attendees[0] as Record<string, unknown> | undefined) ?? {}
  const responses = (payload.responses ?? {}) as Record<string, unknown>

  const attendeeName = String(attendee?.name ?? attendee?.fullName ?? responses.attendeeName ?? '').trim()
  const attendeeEmail = String(attendee?.email ?? responses.email ?? responses.attendeeEmail ?? '').trim()
  const attendeePhone = normalizePhone(
    String(attendee?.phoneNumber ?? responses.attendeePhoneNumber ?? responses.phone ?? ''),
  )
  const startTimeIso = String(payload.startTime ?? payload.start ?? '').trim()
  const endTimeIso = String(payload.endTime ?? payload.end ?? '').trim()
  const metadata = (payload.metadata as Record<string, unknown> | undefined) ?? {}

  const mapsCandidate = String(
    payload.location ?? metadata.mapsLink ?? metadata.locationMapsLink ?? '',
  ).trim()
  const locationMapsLink = mapsCandidate.startsWith('http')
    ? mapsCandidate
    : 'https://maps.google.com/?q=Bucuresti'

  const eventId = `${triggerEvent}:${bookingId}`

  return {
    messageType: 'cal-webhook-event',
    eventId,
    triggerEvent,
    bookingId,
    attendeeName,
    attendeeEmail,
    attendeePhone,
    startTimeIso,
    endTimeIso,
    tenantSlug,
    locationMapsLink,
  }
}

function extractOrganizerUsername(body: unknown): string {
  const row = body as Record<string, unknown>
  const payload = (row?.payload as Record<string, unknown> | undefined) ?? {}
  const organizer = (payload?.organizer as Record<string, unknown> | undefined) ?? {}
  const rootOrganizer = (row?.organizer as Record<string, unknown> | undefined) ?? {}
  const username = String(organizer.username ?? rootOrganizer.username ?? '').trim()
  return username || ''
}

