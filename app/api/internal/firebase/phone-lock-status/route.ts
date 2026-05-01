import { NextResponse } from 'next/server'
import { isAuthorizedInternalRequest } from '@/lib/internal-auth.js'
import { normalizePhone } from '@/lib/phone.js'
import { getPhoneBookingLock } from '@/lib/redis'

export async function POST(request: Request) {
  const expected = process.env.INTERNAL_LOCK_API_TOKEN?.trim()
  if (!isAuthorizedInternalRequest(request, { expectedToken: expected })) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => null)
    const rawPhone = typeof body?.phone === 'string' ? body.phone : ''
    const clientSlug = typeof body?.clientSlug === 'string' ? body.clientSlug : ''
    const phone = normalizePhone(rawPhone)
    if (!phone) return NextResponse.json({ error: 'Invalid phone' }, { status: 400 })
    if (!clientSlug.trim()) return NextResponse.json({ error: 'Missing clientSlug' }, { status: 400 })

    const lock = await getPhoneBookingLock(phone, clientSlug)
    if (!lock) return NextResponse.json({ locked: false })
    return NextResponse.json({
      locked: true,
      createdAt: lock.createdAt,
      bookingUid: lock.bookingUid,
      phone: lock.phone,
      webpage: lock.webpage,
    })
  } catch (error) {
    return NextResponse.json(
      { locked: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

