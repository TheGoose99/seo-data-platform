import { NextResponse } from 'next/server'
import { isAuthorizedInternalRequest } from '@/lib/internal-auth.js'
import { normalizePhone } from '@/lib/phone.js'
import { setPhoneBookingLock } from '@/lib/redis'

export async function POST(request: Request) {
  const expected = process.env.INTERNAL_LOCK_API_TOKEN?.trim()
  if (!isAuthorizedInternalRequest(request, { expectedToken: expected })) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => null)
    const rawPhone = typeof body?.phone === 'string' ? body.phone : ''
    const bookingUid = typeof body?.bookingUid === 'string' ? body.bookingUid : ''
    const clientSlug = typeof body?.clientSlug === 'string' ? body.clientSlug : ''
    const webpage = typeof body?.webpage === 'string' ? body.webpage : 'closeby-demo-project'

    const phone = normalizePhone(rawPhone)
    if (!phone) return NextResponse.json({ error: 'Invalid phone' }, { status: 400 })
    if (!bookingUid) return NextResponse.json({ error: 'Missing bookingUid' }, { status: 400 })
    if (!clientSlug.trim()) return NextResponse.json({ error: 'Missing clientSlug' }, { status: 400 })

    await setPhoneBookingLock(phone, bookingUid, webpage, clientSlug)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

