import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function isProd() {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
}

function isAuthorized(request: Request) {
  const token = process.env.HEALTHCHECK_TOKEN
  if (!token) return false
  return request.headers.get('x-healthcheck-token') === token
}

export async function GET(request: Request) {
  // Avoid exposing a public service-role-backed endpoint in production by default.
  if (isProd() && !isAuthorized(request)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const admin = createAdminClient()

  // Minimal privileged call that proves the service role key works,
  // without returning any user data.
  const { error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 })
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  return NextResponse.json({
    ok: true,
    supabaseUrlHost: (() => {
      try {
        return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').host
      } catch {
        return null
      }
    })(),
  })
}

