import { NextResponse } from 'next/server'
import { buildWorkerPayload, resolveCalWebhookSecretByPayload, verifyCalSharedSecretHeader, verifyCalSignature } from '@/lib/cal/webhook'
import { getWorkerPublicUrl, qstashPublishJson } from '@/lib/qstash'

export async function POST(request: Request) {
  const rawBody = await request.text()
  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { webhookSecret, tenantSlug } = await resolveCalWebhookSecretByPayload(body)
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 500 })
  }

  const signature = request.headers.get('x-cal-signature-256')
  const sharedHeader = request.headers.get('x-cal-webhook-secret')
  const signatureOk = verifyCalSignature(rawBody, signature, webhookSecret)
  const headerOk = verifyCalSharedSecretHeader(sharedHeader, webhookSecret)

  if (!signatureOk && !headerOk) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
  }

  const workerPayload = buildWorkerPayload(body, tenantSlug)
  if (!workerPayload) {
    return NextResponse.json({ error: 'Unsupported payload shape' }, { status: 400 })
  }

  await qstashPublishJson({
    url: getWorkerPublicUrl('/api/qstash/worker'),
    body: workerPayload,
  })

  return NextResponse.json({ ok: true, queued: true })
}

