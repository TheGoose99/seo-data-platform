import { NextResponse } from 'next/server'
import { isAuthorizedInternalRequest } from '@/lib/internal-auth.js'

function readRequired(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

export async function GET(request: Request) {
  const expected = process.env.INTERNAL_LOCK_API_TOKEN?.trim()
  if (!isAuthorizedInternalRequest(request, { expectedToken: expected })) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const firebaseConfig = {
      apiKey: readRequired('NEXT_PUBLIC_FIREBASE_API_KEY'),
      authDomain: readRequired('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
      projectId: readRequired('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
      appId: readRequired('NEXT_PUBLIC_FIREBASE_APP_ID'),
    }

    return NextResponse.json(
      { ok: true, firebaseConfig },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid Firebase config' },
      { status: 500 },
    )
  }
}

