import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { canAccessCloseByAdminApp } from '@/lib/rbac/server'

export default async function AccessDeniedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (await canAccessCloseByAdminApp(supabase, user.id)) {
    redirect('/app')
  }

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold">Access restricted</h1>
      <p className="mt-3 text-sm text-black/70 dark:text-white/70">
        This application is for CloseBy platform administrators only. Your account remains valid for future products;
        there is no self-serve access to this console yet.
      </p>
      <p className="mt-4 text-sm text-black/60 dark:text-white/60">
        Signed in as <span className="font-medium">{user.email}</span>
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/login"
          className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/20 dark:hover:bg-white/10"
        >
          Switch account
        </Link>
      </div>
    </div>
  )
}
