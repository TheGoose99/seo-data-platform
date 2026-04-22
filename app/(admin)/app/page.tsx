import { Bell, BarChart3 } from 'lucide-react'
import { CreateOrgForm } from '@/components/org/create-org-form'
import { createClient } from '@/utils/supabase/server'

export default async function AdminDashboardPage(props: {
  searchParams: Promise<{ org_id?: string }>
}) {
  const searchParams = await props.searchParams
  const orgIdForGoogle = searchParams.org_id?.trim() || null
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: memberships } = user
    ? await supabase
        .from('org_memberships')
        .select('org_id, role, organizations ( id, name )')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
    : { data: null }

  const orgs =
    (memberships ?? [])
      .map((m) => {
        const o = (m as unknown as { organizations?: { id: string; name: string } | null }).organizations
        return o ? { id: o.id, name: o.name } : null
      })
      .filter(Boolean) as Array<{ id: string; name: string }>

  const defaultOrgId = orgIdForGoogle || orgs[0]?.id || null

  return (
    <div className="px-6 py-10 md:px-10">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
      <p className="mt-2 max-w-xl text-sm text-slate-400">
        Overview for the CloseBy admin console. Analytics and live notifications will appear here in a later phase.
      </p>

      {orgIdForGoogle ? (
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm text-slate-400">
            Google OAuth return landed on this page. You can connect Search Console and Business Profile for the
            selected organization.
          </p>
          <a
            href={`/api/auth/google/start?org_id=${encodeURIComponent(orgIdForGoogle)}`}
            className="mt-3 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-950 hover:bg-slate-200"
          >
            Connect Google (GSC + GBP)
          </a>
        </div>
      ) : null}

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-sm font-medium text-slate-200">Client onboarding</h2>
          <p className="mt-2 text-sm text-slate-500">
            Alege o organizație existentă și intră direct în intake (debug). Crearea de org nou e opțională.
          </p>

          {orgs.length ? (
            <div className="mt-4 space-y-2">
              {orgs.map((o) => {
                const selected = defaultOrgId === o.id
                return (
                  <div
                    key={o.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/40 p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-200">{o.name}</div>
                      <div className="mt-1 truncate font-mono text-xs text-slate-500">{o.id}</div>
                    </div>
                    <a
                      href={`/clients/new?org_id=${encodeURIComponent(o.id)}`}
                      className={selected
                        ? 'inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200'
                        : 'inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900'}
                    >
                      Start intake →
                    </a>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-400">
              Nu ai organizații încă. Creează una mai jos (doar operatorii platformei au drepturi).
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-sm font-medium text-slate-200">New organization (optional)</h2>
          <p className="mt-2 text-sm text-slate-500">
            Doar dacă ai nevoie de un workspace nou. După creare vei fi trimis direct la onboarding pentru org.
          </p>
          <div className="mt-4">
            <CreateOrgForm />
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center gap-2 text-slate-200">
            <BarChart3 className="h-5 w-5 text-emerald-400" aria-hidden />
            <h2 className="font-medium">Analytics</h2>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Rankings, heatmaps, and GSC/GBP rollups will surface here once wired to your reporting pipeline.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center gap-2 text-slate-200">
            <Bell className="h-5 w-5 text-amber-400" aria-hidden />
            <h2 className="font-medium">Notifications</h2>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Ingestion alerts, DataForSEO job status, and client milestones will show in this panel when connected.
          </p>
        </div>
      </div>
    </div>
  )
}
