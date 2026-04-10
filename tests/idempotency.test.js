const test = require('node:test')
const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const { createClient } = require('@supabase/supabase-js')

function maybeEnv(name) {
  return process.env[name] || null
}

function randSlug(prefix) {
  return `${prefix}-${crypto.randomBytes(8).toString('hex')}`
}

test('idempotency: upsert twice does not duplicate rows', async (t) => {
  const url = maybeEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceKey = maybeEnv('SUPABASE_SERVICE_ROLE_KEY')

  if (!url || !serviceKey) {
    t.skip('missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const orgName = randSlug('test-org')
  const clientSlug = randSlug('test-client')

  // Create org + client + location + keyword + grid spec + points
  const { data: org, error: orgErr } = await supabase.from('organizations').insert({ name: orgName }).select('id').single()
  assert.ifError(orgErr)

  t.after(async () => {
    // Cascade delete cleans up everything
    await supabase.from('organizations').delete().eq('id', org.id)
  })

  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .insert({ org_id: org.id, client_slug: clientSlug, display_name: 'Test Client' })
    .select('id')
    .single()
  assert.ifError(clientErr)

  const { data: location, error: locErr } = await supabase
    .from('locations')
    .insert({
      org_id: org.id,
      client_id: client.id,
      address_text: 'Test Address 1',
      address_hash: crypto.createHash('sha256').update('test address 1').digest('hex'),
      lat: 44.4,
      lng: 26.1,
    })
    .select('id')
    .single()
  assert.ifError(locErr)

  const { data: keyword, error: kwErr } = await supabase
    .from('keywords')
    .insert({
      org_id: org.id,
      client_id: client.id,
      locale: 'ro-RO',
      keyword_raw: 'psiholog sector 3',
      keyword_norm: 'psiholog sector 3',
    })
    .select('id')
    .single()
  assert.ifError(kwErr)

  const { data: gridSpec, error: gsErr } = await supabase
    .from('grid_specs')
    .insert({
      org_id: org.id,
      location_id: location.id,
      shape: 'square',
      size: 5,
      radius_m: 2000,
      step_m: 1000,
      version: 1,
    })
    .select('id')
    .single()
  assert.ifError(gsErr)

  const points = Array.from({ length: 25 }).map((_, i) => ({
    org_id: org.id,
    grid_spec_id: gridSpec.id,
    point_index: i,
    lat: 44.4 + i * 0.00001,
    lng: 26.1 + i * 0.00001,
  }))

  let r = await supabase.from('grid_points').upsert(points, { onConflict: 'grid_spec_id,point_index' })
  assert.ifError(r.error)
  r = await supabase.from('grid_points').upsert(points, { onConflict: 'grid_spec_id,point_index' })
  assert.ifError(r.error)

  const { data: dbPoints, error: dbpErr } = await supabase
    .from('grid_points')
    .select('id,point_index')
    .eq('grid_spec_id', gridSpec.id)
    .order('point_index', { ascending: true })
  assert.ifError(dbpErr)
  assert.equal(dbPoints.length, 25)

  const day = '2026-01-01'
  const obsRows = dbPoints.map((p) => ({
    org_id: org.id,
    keyword_id: keyword.id,
    grid_point_id: p.id,
    provider: 'dataforseo',
    observed_date: day,
    rank: (p.point_index % 20) + 1,
    top_entities: [],
    raw_payload: null,
  }))

  r = await supabase
    .from('serp_grid_observations')
    .upsert(obsRows, { onConflict: 'keyword_id,grid_point_id,observed_date,provider' })
  assert.ifError(r.error)
  r = await supabase
    .from('serp_grid_observations')
    .upsert(obsRows, { onConflict: 'keyword_id,grid_point_id,observed_date,provider' })
  assert.ifError(r.error)

  const { count, error: cErr } = await supabase
    .from('serp_grid_observations')
    .select('*', { count: 'exact', head: true })
    .eq('keyword_id', keyword.id)
    .eq('observed_date', day)
  assert.ifError(cErr)
  assert.equal(count, 25)
})

