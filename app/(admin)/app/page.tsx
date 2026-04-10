import { Bell, BarChart3 } from 'lucide-react'
import { CreateOrgForm } from '@/components/org/create-org-form'

export default async function AdminDashboardPage(props: {
  searchParams: Promise<{ org_id?: string }>
}) {
  const searchParams = await props.searchParams
  const orgIdForGoogle = searchParams.org_id?.trim() || null

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

      <div className="mt-10 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-sm font-medium text-slate-200">New organization</h2>
        <p className="mt-2 text-sm text-slate-500">
          Create a workspace, then you will be sent to client onboarding for that org.
        </p>
        <div className="mt-4">
          <CreateOrgForm />
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
