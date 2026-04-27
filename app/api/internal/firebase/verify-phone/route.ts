import { NextResponse } from 'next/server'
import { getFirebaseAdminAuth } from '@/lib/firebase-admin.js'
import { isAuthorizedInternalRequest } from '@/lib/internal-auth.js'
import { normalizePhone } from '@/lib/phone.js'

export async function POST(request: Request) {
  const expected = process.env.INTERNAL_LOCK_API_TOKEN?.trim()
  if (!isAuthorizedInternalRequest(request, { expectedToken: expected })) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => null)
    const idToken = typeof body?.idToken === 'string' ? body.idToken : ''
    const phoneRaw = typeof body?.phone === 'string' ? body.phone : ''

    if (!idToken) return NextResponse.json({ error: 'Missing idToken' }, { status: 400 })
    const normalizedInputPhone = normalizePhone(phoneRaw)
    if (!normalizedInputPhone) return NextResponse.json({ error: 'Invalid phone' }, { status: 400 })

    const auth = getFirebaseAdminAuth()
    const decoded = await auth.verifyIdToken(idToken)
    const decodedPhone = normalizePhone(decoded.phone_number ?? '')
    if (!decodedPhone) return NextResponse.json({ error: 'Token has no phone_number' }, { status: 401 })
    if (decodedPhone !== normalizedInputPhone) return NextResponse.json({ error: 'Phone mismatch' }, { status: 401 })

    return NextResponse.json({ verified: true, phone: decodedPhone })
  } catch (error) {
    return NextResponse.json(
      { verified: false, error: error instanceof Error ? error.message : String(error) },
      { status: 401 },
    )
  }
}

