import { createAdminClient } from '@/lib/supabase/admin'
import { getGoogleAccessToken } from '@/lib/providers/google/access-token'
import { enumerateDates } from '@/lib/jobs/date-range'

type GscRow = {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export async function ingestGscDaily(params: {
  orgId: string
  clientId: string
  startDate: string
  endDate: string
}) {
  const admin = createAdminClient()

  const { data: integration, error: integrationErr } = await admin
    .from('org_integrations')
    .select('gsc_site_url')
    .eq('org_id', params.orgId)
    .single()

  if (integrationErr) throw integrationErr
  if (!integration.gsc_site_url) throw new Error('Missing org_integrations.gsc_site_url')

  const { data: conn, error: connErr } = await admin
    .from('google_connections')
    .select('encrypted_refresh_token')
    .eq('org_id', params.orgId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (connErr) throw connErr
  if (!conn?.encrypted_refresh_token) throw new Error('Missing google connection for org')

  const accessToken = await getGoogleAccessToken(conn.encrypted_refresh_token)

  const days = enumerateDates(params.startDate, params.endDate)
  for (const day of days) {
    const res = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
        integration.gsc_site_url,
      )}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          startDate: day,
          endDate: day,
          dimensions: ['query', 'page', 'device', 'country'],
          rowLimit: 25000,
        }),
      },
    )

    if (!res.ok) throw new Error(`GSC query failed: ${await res.text()}`)
    const json = (await res.json()) as { rows?: GscRow[] }

    const rows = json.rows ?? []
    if (rows.length === 0) continue

    const payload = rows.map((r) => ({
      org_id: params.orgId,
      client_id: params.clientId,
      metric_date: day,
      query: r.keys[0] ?? '',
      page: r.keys[1] ?? '',
      device: r.keys[2] ?? '',
      country: r.keys[3] ?? '',
      clicks: Math.trunc(r.clicks ?? 0),
      impressions: Math.trunc(r.impressions ?? 0),
      ctr: Number(r.ctr ?? 0),
      position: Number(r.position ?? 0),
    }))

    const { error: upErr } = await admin
      .from('gsc_search_analytics_daily')
      .upsert(payload, { onConflict: 'client_id,metric_date,query,page,device,country' })

    if (upErr) throw upErr
  }
}

