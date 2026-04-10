import { redirect } from 'next/navigation'

export default async function ClientDetailRedirect(props: {
  params: Promise<{ clientId: string }>
  searchParams: Promise<{ org_id?: string }>
}) {
  const { clientId } = await props.params
  const searchParams = await props.searchParams
  const orgId = searchParams.org_id
  const q = new URLSearchParams()
  q.set('selected', clientId)
  if (orgId) q.set('org_id', orgId)
  redirect(`/app/clients?${q.toString()}`)
}
