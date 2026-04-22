import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { canMutateOrgData } from '@/lib/rbac/server'
import { onboardingIntakeSchema } from '@/lib/validation/onboarding-intake'
import { zodErrorMessage } from '@/lib/validation/parse'

type MaskablePayload = { automation?: { calApiKey?: string } }

function maskSecrets<T extends MaskablePayload>(payload: T): T {
  const clone = JSON.parse(JSON.stringify(payload)) as T
  const key = clone.automation?.calApiKey
  if (typeof key === 'string' && key.trim()) {
    if (!clone.automation) clone.automation = {}
    clone.automation.calApiKey = `••••${key.trim().slice(-4)}`
  }
  return clone as T
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = onboardingIntakeSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 })
  }

  const body = parsed.data

  if (!(await canMutateOrgData(supabase, body.orgId, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ ok: true, payload: maskSecrets(body) })
}

