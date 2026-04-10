import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function normalizeText(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, ' ')
}

function addressHash(addressText: string) {
  const norm = normalizeText(addressText).replace(/[^\p{L}\p{N}\s]/gu, '')
  return crypto.createHash('sha256').update(norm, 'utf8').digest('hex')
}

type Body = {
  orgId: string
  clientSlug: string
  displayName: string
  primaryDomain?: string
  location: {
    addressText: string
    lat: number | null
    lng: number | null
    placeId: string | null
    gbpLocationId: string | null
  }
  keywords: string[]
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json()) as Body
  if (!body.orgId) return NextResponse.json({ error: 'Missing orgId' }, { status: 400 })

  const { data: membership } = await supabase
    .from('org_memberships')
    .select('role')
    .eq('org_id', body.orgId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const clientSlug = normalizeText(body.clientSlug).replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
  const displayName = (body.displayName ?? '').trim()
  if (!clientSlug || !displayName) return NextResponse.json({ error: 'Missing client fields' }, { status: 400 })

  const locAddress = (body.location?.addressText ?? '').trim()
  if (!locAddress) return NextResponse.json({ error: 'Missing address' }, { status: 400 })

  const kws = (body.keywords ?? []).map((k) => k.trim()).filter(Boolean)
  if (kws.length === 0) return NextResponse.json({ error: 'Provide at least 1 keyword' }, { status: 400 })

  const admin = createAdminClient()

  const { data: client, error: clientErr } = await admin
    .from('clients')
    .insert({
      org_id: body.orgId,
      client_slug: clientSlug,
      display_name: displayName,
      primary_domain: body.primaryDomain?.trim() || null,
    })
    .select('id')
    .single()

  if (clientErr) return NextResponse.json({ error: clientErr.message }, { status: 400 })

  const { data: location, error: locErr } = await admin
    .from('locations')
    .insert({
      org_id: body.orgId,
      client_id: client.id,
      gbp_location_id: body.location.gbpLocationId,
      place_id: body.location.placeId,
      address_text: locAddress,
      address_hash: addressHash(locAddress),
      lat: body.location.lat,
      lng: body.location.lng,
    })
    .select('id')
    .single()

  if (locErr) return NextResponse.json({ error: locErr.message }, { status: 400 })

  const keywordRows = kws.map((kw) => ({
    org_id: body.orgId,
    client_id: client.id,
    locale: 'ro-RO',
    keyword_raw: kw,
    keyword_norm: normalizeText(kw),
  }))

  const { error: kwErr } = await admin.from('keywords').upsert(keywordRows, {
    onConflict: 'org_id,client_id,locale,keyword_norm',
  })

  if (kwErr) return NextResponse.json({ error: kwErr.message }, { status: 400 })

  return NextResponse.json({ ok: true, clientId: client.id, locationId: location.id })
}

