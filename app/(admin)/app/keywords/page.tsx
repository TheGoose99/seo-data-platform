import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getOperatorOrgId, canMutateOrgData } from '@/lib/rbac/server'

export default async function AdminKeywordsIndexPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const operatorOrgId = await getOperatorOrgId(supabase)
  if (!operatorOrgId) {
    return (
      <div className="px-6 py-10 text-slate-300 md:px-10">
        <p className="text-sm text-slate-400">No platform operator organization configured.</p>
      </div>
    )
  }

  if (!(await canMutateOrgData(supabase, operatorOrgId, user.id))) {
    redirect('/access-denied')
  }

  const { data: clients } = await supabase
    .from('clients')
    .select('id,display_name,client_slug')
    .eq('org_id', operatorOrgId)
    .order('display_name', { ascending: true })
    .limit(200)

  return (
    <div className="px-6 py-10 md:px-10">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Keywords</h1>
      <p className="mt-2 max-w-xl text-sm text-slate-400">
        Keywords are managed per client. Choose a client to add, remove, or sync SERP data from DataForSEO.
      </p>

      <ul className="mt-8 divide-y divide-slate-800 rounded-xl border border-slate-800">
        {(clients ?? []).length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-slate-500">No clients yet.</li>
        ) : (
          (clients ?? []).map((c) => (
            <li key={c.id}>
              <Link
                href={`/app/clients/${c.id}/keywords?org_id=${encodeURIComponent(operatorOrgId)}`}
                className="flex items-center justify-between px-4 py-4 text-sm text-slate-200 hover:bg-slate-900/50"
              >
                <span className="font-medium">{c.display_name}</span>
                <span className="text-slate-500">{c.client_slug}</span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
