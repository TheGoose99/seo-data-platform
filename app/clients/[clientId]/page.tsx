import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

function websiteUrl(primaryDomain: string | null) {
  if (!primaryDomain) return null
  const d = primaryDomain.trim()
  if (!d) return null
  if (d.startsWith('http://') || d.startsWith('https://')) return d
  return `https://${d}`
}

function mapsUrlFromPlaceId(placeId: string | null) {
  if (!placeId) return null
  return `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(placeId)}`
}

function mapsUrlFromLatLng(lat: number | null, lng: number | null) {
  if (lat == null || lng == null) return null
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`
}

export default async function ClientDetailPage(props: {
  params: Promise<{ clientId: string }>
  searchParams: Promise<{ org_id?: string }>
}) {
  const { clientId } = await props.params
  const searchParams = await props.searchParams
  const orgId = searchParams.org_id
  if (!orgId) redirect('/org')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('org_memberships')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!membership) redirect('/org')

  const { data: client } = await supabase
    .from('clients')
    .select('id,org_id,display_name,client_slug,primary_domain,created_at')
    .eq('id', clientId)
    .eq('org_id', orgId)
    .maybeSingle()
  if (!client) redirect(`/clients?org_id=${encodeURIComponent(orgId)}`)

  const { data: locations } = await supabase
    .from('locations')
    .select('id,address_text,lat,lng,place_id,gbp_location_id,created_at')
    .eq('client_id', clientId)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  const { data: keywords } = await supabase
    .from('keywords')
    .select('id,keyword_raw,created_at')
    .eq('client_id', clientId)
    .eq('org_id', orgId)
    .order('created_at', { ascending: true })

  const primaryLocation = locations?.[0] ?? null
  const website = websiteUrl(client.primary_domain ?? null)
  const maps = mapsUrlFromPlaceId(primaryLocation?.place_id ?? null) ?? mapsUrlFromLatLng(primaryLocation?.lat ?? null, primaryLocation?.lng ?? null)
  const gbp = primaryLocation?.gbp_location_id ? `https://business.google.com/locations/l/${encodeURIComponent(primaryLocation.gbp_location_id)}` : null

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href={`/clients?org_id=${encodeURIComponent(orgId)}`} className="text-sm underline underline-offset-4">
            Back to clients
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">{client.display_name}</h1>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            {client.primary_domain ?? client.client_slug}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/${encodeURIComponent(client.id)}/${encodeURIComponent(primaryLocation?.id ?? '')}?org_id=${encodeURIComponent(orgId)}`}
            className={`rounded-md bg-black px-3 py-2 text-sm font-medium text-white transition-all duration-150 ease-out hover:shadow-sm hover:-translate-y-px active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:bg-white dark:text-black dark:focus-visible:ring-white/30 ${
              primaryLocation?.id ? '' : 'pointer-events-none opacity-50'
            }`}
          >
            Open analytics
          </Link>
          {website ? (
            <a
              href={website}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-black/10 px-3 py-2 text-sm transition-all duration-150 ease-out hover:bg-black/[.04] hover:shadow-sm hover:-translate-y-px active:translate-y-0 active:scale-[0.99] dark:border-white/15 dark:hover:bg-white/10"
            >
              Website
            </a>
          ) : null}
          {maps ? (
            <a
              href={maps}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-black/10 px-3 py-2 text-sm transition-all duration-150 ease-out hover:bg-black/[.04] hover:shadow-sm hover:-translate-y-px active:translate-y-0 active:scale-[0.99] dark:border-white/15 dark:hover:bg-white/10"
            >
              Google Maps
            </a>
          ) : null}
          {gbp ? (
            <a
              href={gbp}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-black/10 px-3 py-2 text-sm transition-all duration-150 ease-out hover:bg-black/[.04] hover:shadow-sm hover:-translate-y-px active:translate-y-0 active:scale-[0.99] dark:border-white/15 dark:hover:bg-white/10"
            >
              GBP
            </a>
          ) : null}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-black/10 p-6 dark:border-white/15">
          <h2 className="text-lg font-semibold">Client data</h2>
          <div className="mt-3 space-y-2 text-sm text-black/70 dark:text-white/70">
            <div>
              <span className="text-black/50 dark:text-white/50">Slug:</span> {client.client_slug}
            </div>
            <div>
              <span className="text-black/50 dark:text-white/50">Created:</span>{' '}
              {client.created_at ? new Date(client.created_at).toLocaleString() : '—'}
            </div>
          </div>

          <div className="mt-4 text-xs text-black/50 dark:text-white/50">
            Edit/update/delete UI will live here next (API endpoints will be added in the next step).
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 p-6 dark:border-white/15">
          <h2 className="text-lg font-semibold">Keywords</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(keywords ?? []).slice(0, 50).map((k) => (
              <span
                key={k.id}
                className="inline-flex items-center rounded-full border border-black/15 bg-black/[.04] px-3 py-1 text-xs font-medium dark:border-white/20 dark:bg-white/10"
              >
                {k.keyword_raw}
              </span>
            ))}
          </div>
          {(keywords ?? []).length > 50 ? (
            <div className="mt-3 text-xs text-black/50 dark:text-white/50">Showing first 50.</div>
          ) : null}
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-black/10 p-6 dark:border-white/15">
        <h2 className="text-lg font-semibold">Locations</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-black/60 dark:text-white/60">
              <tr>
                <th className="py-2 pr-4">Address</th>
                <th className="py-2 pr-4">Lat/Lng</th>
                <th className="py-2 pr-4">Place ID</th>
                <th className="py-2 pr-4">GBP</th>
              </tr>
            </thead>
            <tbody>
              {(locations ?? []).map((l) => (
                <tr key={l.id} className="border-t border-black/5 dark:border-white/10">
                  <td className="py-2 pr-4">{l.address_text}</td>
                  <td className="py-2 pr-4">
                    {l.lat ?? '—'},{' '}{l.lng ?? '—'}
                  </td>
                  <td className="py-2 pr-4">{l.place_id ?? '—'}</td>
                  <td className="py-2 pr-4">{l.gbp_location_id ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

