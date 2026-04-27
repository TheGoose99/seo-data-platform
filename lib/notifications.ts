import type { BookingWorkerPayload } from '@/lib/booking-events'

type TemplateKind = 'confirmation' | 'reminder' | 'decline'

function getMetaWhatsAppCoreConfig() {
  const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID?.trim()
  const accessToken = process.env.META_WA_ACCESS_TOKEN?.trim()
  const templateLang = process.env.META_WA_TEMPLATE_LANG?.trim() || 'ro'
  if (!phoneNumberId || !accessToken) {
    throw new Error('Missing META_WA_PHONE_NUMBER_ID or META_WA_ACCESS_TOKEN')
  }
  return { phoneNumberId, accessToken, templateLang }
}

function isHelloWorldTestMode(): boolean {
  return process.env.META_WA_TEST_USE_HELLO_WORLD === '1'
}

function getProductionTemplateName(kind: TemplateKind): string {
  const defaults: Record<TemplateKind, string> = {
    confirmation: 'confirmation_reminder_booking_calcom',
    reminder: 'reminder_booking_calcom',
    decline: 'decline_booking_calcom',
  }
  const envKey: Record<TemplateKind, string> = {
    confirmation: 'META_WA_TEMPLATE_CONFIRMATION',
    reminder: 'META_WA_TEMPLATE_REMINDER',
    decline: 'META_WA_TEMPLATE_DECLINE',
  }
  const fromEnv = process.env[envKey[kind]]?.trim()
  return fromEnv || defaults[kind]
}

function resolveTemplateName(kind: TemplateKind): string {
  if (isHelloWorldTestMode()) return 'hello_world'
  return getProductionTemplateName(kind)
}

function templateBodyMode(): 'single' | 'three' {
  const raw = process.env.META_WA_TEMPLATE_BODY_MODE?.trim().toLowerCase()
  if (raw === 'single' || raw === '1' || raw === 'one') return 'single'
  if (raw === 'three' || raw === '3') return 'three'
  return isHelloWorldTestMode() ? 'single' : 'three'
}

function getResendApiKey() {
  const key = process.env.RESEND_API_KEY?.trim()
  if (!key) throw new Error('Missing RESEND_API_KEY')
  return key
}

function getFromEmailAddress(): string {
  return process.env.RESEND_FROM?.trim() || 'noreply@closeby.studio'
}

function formatRoDateTime(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return new Intl.DateTimeFormat('ro-RO', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Bucharest',
  }).format(d)
}

function normalizeToWhatsAppAddress(phone: string): string {
  const raw = phone.trim().replace(/^whatsapp:/, '')
  if (!raw) throw new Error('Missing attendee phone for WhatsApp')
  return raw
}

async function sendMetaTemplateByKind(
  kind: TemplateKind,
  toPhone: string,
  variables: Record<string, string>,
): Promise<{ messages?: Array<{ id: string }> }> {
  const { phoneNumberId, accessToken, templateLang } = getMetaWhatsAppCoreConfig()
  const templateName = resolveTemplateName(kind)
  const mode = templateBodyMode()
  const bodyParameters =
    mode === 'single'
      ? [
          {
            type: 'text',
            text: `${variables.name} · ${variables.dateTime} · ${variables.mapsLink}`.slice(0, 1024),
          },
        ]
      : [
          { type: 'text', text: variables.name },
          { type: 'text', text: variables.dateTime },
          { type: 'text', text: variables.mapsLink },
        ]

  const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: normalizeToWhatsAppAddress(toPhone),
      type: 'template',
      template: {
        name: templateName,
        language: { code: templateLang },
        components: [
          {
            type: 'body',
            parameters: bodyParameters,
          },
        ],
      },
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Meta WhatsApp send failed (${response.status}): ${text}`)
  }

  return response.json().catch(() => ({}))
}

async function sendResendEmail(params: { to: string; subject: string; html: string; text: string }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getResendApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: getFromEmailAddress(),
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Resend send failed (${response.status}): ${text}`)
  }
}

export async function sendAcceptedWhatsApp(payload: BookingWorkerPayload) {
  const messageDate = formatRoDateTime(payload.startTimeIso)
  return sendMetaTemplateByKind('confirmation', payload.attendeePhone, {
    name: payload.attendeeName || 'draga pacienta',
    dateTime: messageDate,
    mapsLink: payload.locationMapsLink,
  })
}

export async function sendReminderWhatsApp(payload: BookingWorkerPayload) {
  const messageDate = formatRoDateTime(payload.startTimeIso)
  return sendMetaTemplateByKind('reminder', payload.attendeePhone, {
    name: payload.attendeeName || 'draga pacienta',
    dateTime: messageDate,
    mapsLink: payload.locationMapsLink,
  })
}

export async function sendDeclinedWhatsApp(payload: BookingWorkerPayload) {
  const messageDate = formatRoDateTime(payload.startTimeIso)
  return sendMetaTemplateByKind('decline', payload.attendeePhone, {
    name: payload.attendeeName || 'draga pacienta',
    dateTime: messageDate,
    mapsLink: payload.locationMapsLink,
  })
}

export async function sendCancelledEmail(payload: BookingWorkerPayload) {
  const text = 'Programarea ta a fost anulată. Dacă dorești, poți alege imediat un alt interval.'
  await sendResendEmail({
    to: payload.attendeeEmail,
    subject: 'Programare anulată',
    html: `<p>${text}</p>`,
    text,
  })
}

