import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { canAccessCloseByAdminApp, canMutateOrgData } from '@/lib/rbac/server'
import { OnboardClientForm, type OnboardInitialClient } from '@/components/onboarding/onboard-client-form'

export default async function NewClientPage(props: { searchParams: Promise<{ org_id?: string }> }) {
  const searchParams = await props.searchParams
  const orgId = searchParams.org_id
  if (!orgId) redirect('/app')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (!(await canAccessCloseByAdminApp(supabase, user.id))) {
    redirect('/access-denied')
  }

  if (!(await canMutateOrgData(supabase, orgId, user.id))) {
    redirect('/app')
  }

  const { data: existingClient } = await supabase
    .from('clients')
    .select('id,client_slug,display_name,primary_domain')
    .eq('org_id', orgId)
    .maybeSingle()

  let initialClient: OnboardInitialClient | null = null

  if (existingClient) {
    const { data: loc } = await supabase
      .from('locations')
      .select('id,address_text,lat,lng,place_id,gbp_location_id')
      .eq('client_id', existingClient.id)
      .eq('org_id', orgId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    const { data: kws } = await supabase
      .from('keywords')
      .select('keyword_raw')
      .eq('client_id', existingClient.id)
      .eq('org_id', orgId)
      .order('created_at', { ascending: true })

    if (loc) {
      initialClient = {
        clientId: existingClient.id,
        locationId: loc.id,
        displayName: existingClient.display_name,
        clientSlug: existingClient.client_slug,
        primaryDomain: existingClient.primary_domain ?? '',
        addressText: loc.address_text,
        lat: loc.lat != null ? String(loc.lat) : '',
        lng: loc.lng != null ? String(loc.lng) : '',
        placeId: loc.place_id ?? '',
        gbpLocationId: loc.gbp_location_id ?? '',
        keywords: (kws ?? []).map((k) => k.keyword_raw),
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{initialClient ? 'Edit client' : 'Onboard client'}</h1>
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">
            {initialClient
              ? 'Update client, primary location, and keywords. Coordinates should come from Google Places selection.'
              : 'Create client + location + keywords. Pick an address from Google to set coordinates.'}
          </p>
        </div>
        <Link href="/app" className="text-sm underline underline-offset-4">
          Admin home
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-black/10 p-6 dark:border-white/15">
        <OnboardClientForm orgId={orgId} initialClient={initialClient} />
      </div>
    </div>
  )
}
