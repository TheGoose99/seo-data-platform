/**
 * Integration: `clients` row for TEST_CLIENT_ID has public Cal columns matching the mock bundle.
 * Requires `supabase/seeds/test_client_cal.sql` applied + `.env.local` with service role.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const expected = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'fixtures', 'test-client-cal-expected.json'), 'utf8')
)

test('test client Cal columns match mock-aligned fixture', async (t) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    t.skip('missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supabase
    .from('clients')
    .select('cal_com_username, cal_com_canonical_event_slugs, cal_com_event_slugs')
    .eq('id', expected.clientId)
    .maybeSingle()

  assert.ifError(error)

  if (!data) {
    t.skip(
      `no client row for ${expected.clientId}; create the client or run supabase/seeds/test_client_cal.sql after the row exists`
    )
    return
  }

  assert.equal(data.cal_com_username, expected.calComUsername)
  assert.deepEqual(data.cal_com_canonical_event_slugs, expected.calComCanonicalEventSlugs)
  assert.deepEqual(data.cal_com_event_slugs, expected.calComEventSlugs)
})
