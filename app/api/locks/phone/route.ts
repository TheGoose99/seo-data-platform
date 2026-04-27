import { NextResponse } from 'next/server'
import { checkAndLock } from '@/lib/redis'

function isAuthorized(request: Request): boolean {
  const expected = process.env.INTERNAL_LOCK_API_TOKEN?.trim()
  const strict =
    process.env.NODE_ENV === 'production' ||
    process.env.INTERNAL_LOCK_API_TOKEN_REQUIRED === '1' ||
    process.env.INTERNAL_LOCK_API_STRICT === '1'

  if (strict && !expected) return false
  if (!expected) return true
  const given = request.headers.get('x-internal-token')?.trim()
  return given === expected
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const phone = String((body as { phone?: string } | null)?.phone ?? '').trim()
  if (!phone) {
    return NextResponse.json({ error: 'Missing phone' }, { status: 400 })
  }

  const result = await checkAndLock(phone)
  if (!result.allowed) {
    return NextResponse.json({ allowed: false, locked: true }, { status: 200 })
  }

  return NextResponse.json({ allowed: true, locked: false }, { status: 200 })
}

