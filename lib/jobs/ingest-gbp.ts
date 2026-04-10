import { createAdminClient } from '@/lib/supabase/admin'
import { getGoogleAccessToken } from '@/lib/providers/google/access-token'
import { enumerateDates } from '@/lib/jobs/date-range'

type Metric = { metric: string; datedValues: Array<{ date: { year: number; month: number; day: number }; value: string }> }

function toISODate(d: { year: number; month: number; day: number }) {
  const mm = String(d.month).padStart(2, '0')
  const dd = String(d.day).padStart(2, '0')
  return `${d.year}-${mm}-${dd}`
}

export async function ingestGbpDaily(params: {
  orgId: string
  locationId: string
  startDate: string
  endDate: string
}) {
  const admin = createAdminClient()

  const { data: loc, error: locErr } = await admin
    .from('locations')
    .select('gbp_location_id')
    .eq('id', params.locationId)
    .eq('org_id', params.orgId)
    .single()

  if (locErr) throw locErr
  if (!loc.gbp_location_id) throw new Error('Missing locations.gbp_location_id')

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

  // Business Profile Performance API: fetchMultiDailyMetricsTimeSeries
  // Docs: https://developers.google.com/my-business/reference/businessprofileperformance/rest
  const endpoint = `https://businessprofileperformance.googleapis.com/v1/${encodeURIComponent(
    loc.gbp_location_id,
  )}:fetchMultiDailyMetricsTimeSeries`

  // We request the full range, then upsert per day.
  const body = {
    dailyMetrics: [
      'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
      'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
      'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
      'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
      'WEBSITE_CLICKS',
      'CALL_CLICKS',
      'DIRECTIONS_REQUESTS',
    ],
    timeRange: {
      startDate: {
        year: Number(params.startDate.slice(0, 4)),
        month: Number(params.startDate.slice(5, 7)),
        day: Number(params.startDate.slice(8, 10)),
      },
      endDate: {
        year: Number(params.endDate.slice(0, 4)),
        month: Number(params.endDate.slice(5, 7)),
        day: Number(params.endDate.slice(8, 10)),
      },
    },
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`GBP metrics failed: ${await res.text()}`)
  const json = (await res.json()) as { multiDailyMetricTimeSeries?: Metric[] }

  const series = json.multiDailyMetricTimeSeries ?? []
  const byDate = new Map<string, Record<string, number>>()

  for (const s of series) {
    for (const dv of s.datedValues ?? []) {
      const day = toISODate(dv.date)
      const current = byDate.get(day) ?? {}
      current[s.metric] = Number(dv.value ?? 0)
      byDate.set(day, current)
    }
  }

  const days = enumerateDates(params.startDate, params.endDate)
  const rows = days.map((day) => {
    const m = byDate.get(day) ?? {}
    const mapsViews = (m.BUSINESS_IMPRESSIONS_DESKTOP_MAPS ?? 0) + (m.BUSINESS_IMPRESSIONS_MOBILE_MAPS ?? 0)
    const searches =
      (m.BUSINESS_IMPRESSIONS_DESKTOP_SEARCH ?? 0) + (m.BUSINESS_IMPRESSIONS_MOBILE_SEARCH ?? 0)
    return {
      org_id: params.orgId,
      location_id: params.locationId,
      metric_date: day,
      views: Math.trunc(mapsViews),
      searches: Math.trunc(searches),
      calls: Math.trunc(m.CALL_CLICKS ?? 0),
      directions: Math.trunc(m.DIRECTIONS_REQUESTS ?? 0),
      website_clicks: Math.trunc(m.WEBSITE_CLICKS ?? 0),
    }
  })

  const { error: upErr } = await admin
    .from('gbp_daily_metrics')
    .upsert(rows, { onConflict: 'location_id,metric_date' })

  if (upErr) throw upErr
}

