export type BookingMessageType = 'cal-webhook-event' | 'booking-reminder-24h'

export type BookingWorkerPayload = {
  messageType: BookingMessageType
  eventId: string
  triggerEvent: string
  bookingId: string
  attendeeName: string
  attendeeEmail: string
  attendeePhone: string
  startTimeIso: string
  endTimeIso: string
  tenantSlug: string
  locationMapsLink: string
}

export function isBookingWorkerPayload(input: unknown): input is BookingWorkerPayload {
  const row = input as Record<string, unknown> | null
  if (!row || typeof row !== 'object') return false
  return (
    typeof row.messageType === 'string' &&
    typeof row.eventId === 'string' &&
    typeof row.triggerEvent === 'string' &&
    typeof row.bookingId === 'string' &&
    typeof row.attendeeName === 'string' &&
    typeof row.attendeeEmail === 'string' &&
    typeof row.attendeePhone === 'string' &&
    typeof row.startTimeIso === 'string' &&
    typeof row.endTimeIso === 'string' &&
    typeof row.tenantSlug === 'string' &&
    typeof row.locationMapsLink === 'string'
  )
}

