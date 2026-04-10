import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getOperatorOrgId, canMutateOrgData } from '@/lib/rbac/server'
import Link from 'next/link'
import { KeywordsManagePanel } from '@/components/admin/keywords-manage-panel'

export default async function ClientKeywordsPage(props: {
  params: Promise<{ clientId: string }>
  searchParams: Promise<{ org_id?: string }>
}) {
  const { clientId } = await props.params
  const searchParams = await props.searchParams
  const orgIdParam = searchParams.org_id

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const operatorOrgId = await getOperatorOrgId(supabase)
  if (!operatorOrgId) redirect('/app/clients')

  const orgId = orgIdParam ?? operatorOrgId
  if (orgId !== operatorOrgId) {
    redirect(`/app/clients/${clientId}/keywords?org_id=${encodeURIComponent(operatorOrgId)}`)
  }

  if (!(await canMutateOrgData(supabase, orgId, user.id))) {
    redirect('/access-denied')
  }

  const { data: client } = await supabase
    .from('clients')
    .select('id,display_name')
    .eq('id', clientId)
    .eq('org_id', orgId)
    .maybeSingle()

  if (!client) redirect('/app/clients')

  const { data: location } = await supabase
    .from('locations')
    .select('id,lat,lng')
    .eq('client_id', clientId)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: keywords } = await supabase
    .from('keywords')
    .select('id,keyword_raw')
    .eq('client_id', clientId)
    .eq('org_id', orgId)
    .order('created_at', { ascending: true })

  const hasLatLng = location?.lat != null && location?.lng != null
  const dataForSeoConfigured = Boolean(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD)

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/app/clients" className="text-sm text-slate-400 hover:text-slate-200">
          ← Clients
        </Link>
      </div>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">Keywords · {client.display_name}</h1>
      <p className="mt-2 text-sm text-slate-400">
        Edit tracked keywords and run DataForSEO SERP grid ingest when the location has coordinates.
      </p>

      <div className="mt-8 max-w-2xl">
        <KeywordsManagePanel
          orgId={orgId}
          clientId={clientId}
          locationId={location?.id ?? null}
          initialKeywords={(keywords ?? []).map((k) => k.keyword_raw)}
          hasLatLng={hasLatLng}
          dataForSeoConfigured={dataForSeoConfigured}
        />
      </div>
    </div>
  )
}
