import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { canAccessCloseByAdminApp, canMutateOrgData } from '@/lib/rbac/server'
import { PsychologistIntakeForm } from '@/components/onboarding/psychologist-intake-form'

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
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Onboarding intake (debug)</h1>
          <p className="mt-2 text-sm text-slate-400">
            Build the full intake payload. Final step displays JSON only (no Supabase writes, no deploy).
          </p>
        </div>
        <Link href="/app" className="text-sm underline underline-offset-4">
          Admin home
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
        <PsychologistIntakeForm orgId={orgId} />
      </div>
    </div>
  )
}
