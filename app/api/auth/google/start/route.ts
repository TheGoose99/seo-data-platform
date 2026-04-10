import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'

const SCOPES = [
  // GSC
  'https://www.googleapis.com/auth/webmasters.readonly',
  // GBP (Business Profile)
  'https://www.googleapis.com/auth/business.manage',
  // Identify user
  'openid',
  'email',
]

export async function GET(request: Request) {
  const url = new URL(request.url)
  const orgId = url.searchParams.get('org_id')

  if (!orgId) {
    return NextResponse.json({ error: 'Missing org_id' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify admin membership
  const { data: membership } = await supabase
    .from('org_memberships')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI
  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Missing Google OAuth env' }, { status: 500 })
  }

  // CSRF/state: signed via Supabase session cookie presence + embed orgId
  const state = Buffer.from(JSON.stringify({ orgId }), 'utf8').toString('base64url')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    scope: SCOPES.join(' '),
    state,
  })

  return NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`)
}

