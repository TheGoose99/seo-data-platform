import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json()) as { name?: string }
  const name = (body.name ?? '').trim()
  if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 })

  const admin = createAdminClient()

  const { data: org, error: orgErr } = await admin
    .from('organizations')
    .insert({ name })
    .select('id')
    .single()

  if (orgErr) return NextResponse.json({ error: orgErr.message }, { status: 500 })

  const { error: memErr } = await admin.from('org_memberships').insert({
    org_id: org.id,
    user_id: user.id,
    role: 'owner',
  })

  if (memErr) return NextResponse.json({ error: memErr.message }, { status: 500 })

  // Initialize settings row
  await admin.from('org_integrations').upsert({ org_id: org.id }, { onConflict: 'org_id' })

  return NextResponse.json({ ok: true, orgId: org.id })
}

