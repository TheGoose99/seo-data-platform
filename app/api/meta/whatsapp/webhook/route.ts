import crypto from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'

function timingSafeEqual(a: string, b: string) {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

function verifySignature(opts: { appSecret: string; signatureHeader: string | null; rawBody: string }) {
  const sig = opts.signatureHeader?.trim() ?? ''
  if (!sig.startsWith('sha256=')) return false
  const their = sig.slice('sha256='.length)
  const ours = crypto.createHmac('sha256', opts.appSecret).update(opts.rawBody, 'utf8').digest('hex')
  return timingSafeEqual(their, ours)
}

/**
 * Meta Webhooks verification.
 * Meta sends GET with:
 *  - hub.mode=subscribe
 *  - hub.verify_token=<your token>
 *  - hub.challenge=<random string>
 *
 * On success, respond 200 with challenge as plain text.
 * Reference: https://hookdeck.com/webhooks/platforms/guide-to-whatsapp-webhooks-features-and-best-practices
 */
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('hub.mode')
  const token = request.nextUrl.searchParams.get('hub.verify_token')
  const challenge = request.nextUrl.searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
  if (!verifyToken) {
    return NextResponse.json({ error: 'Missing WHATSAPP_WEBHOOK_VERIFY_TOKEN' }, { status: 500 })
  }

  if (mode === 'subscribe' && token === verifyToken && challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

/**
 * WhatsApp Cloud API webhook receiver.
 *
 * In debug phase we only:
 *  - optionally verify X-Hub-Signature-256 if META_APP_SECRET is set
 *  - parse JSON and return 200 quickly
 *
 * Do not do heavy work inline; move processing to a queue later.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  const appSecret = process.env.META_APP_SECRET?.trim()
  if (appSecret) {
    const sig = request.headers.get('x-hub-signature-256')
    const ok = verifySignature({ appSecret, signatureHeader: sig, rawBody })
    if (!ok) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    if (rawBody) JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // TODO: enqueue to processing pipeline (do not log PII in prod).
  return NextResponse.json({ ok: true })
}

