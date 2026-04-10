import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { canAccessCloseByAdminApp } from '@/lib/rbac/server'
import { AdminShell } from '@/components/admin/admin-shell'

export default async function AdminGroupLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (!(await canAccessCloseByAdminApp(supabase, user.id))) {
    redirect('/access-denied')
  }

  return <AdminShell userEmail={user.email ?? null}>{children}</AdminShell>
}
