import type { SupabaseClient } from '@supabase/supabase-js'

/** Owner or admin of the platform operator org (CloseBy). */
export async function isPlatformOperatorAdmin(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data: op } = await supabase
    .from('organizations')
    .select('id')
    .eq('is_platform_operator', true)
    .maybeSingle()

  const operatorOrgId = op?.id as string | undefined
  if (!operatorOrgId) return false

  const { data: m } = await supabase
    .from('org_memberships')
    .select('role')
    .eq('org_id', operatorOrgId)
    .eq('user_id', userId)
    .maybeSingle()

  return Boolean(m && (m.role === 'owner' || m.role === 'admin'))
}

export async function getOrgMembershipRole(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
): Promise<'owner' | 'admin' | 'member' | 'viewer' | null> {
  const { data } = await supabase
    .from('org_memberships')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .maybeSingle()

  const r = data?.role
  if (r === 'owner' || r === 'admin' || r === 'member' || r === 'viewer') return r
  return null
}

export async function isOrgMember(supabase: SupabaseClient, orgId: string, userId: string): Promise<boolean> {
  const role = await getOrgMembershipRole(supabase, orgId, userId)
  return role !== null
}

/**
 * CloseBy platform operator actions: create orgs, connect Google, ingest, onboard new clients, Places proxy during onboarding.
 */
export async function canMutateOrgData(supabase: SupabaseClient, orgId: string, userId: string): Promise<boolean> {
  if (!(await isPlatformOperatorAdmin(supabase, userId))) return false
  return isOrgMember(supabase, orgId, userId)
}

/**
 * Edit client display name, domain, slug, locations, keywords — any org member except viewers.
 * CloseBy operators in the org also qualify via membership role.
 */
export async function canEditOrgBusinessData(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
): Promise<boolean> {
  const role = await getOrgMembershipRole(supabase, orgId, userId)
  if (!role || role === 'viewer') return false
  return true
}

/**
 * Delete a client: org owner/admin or CloseBy platform operator in the org.
 */
export async function canDeleteOrgClient(supabase: SupabaseClient, orgId: string, userId: string): Promise<boolean> {
  if (await canMutateOrgData(supabase, orgId, userId)) return true
  const role = await getOrgMembershipRole(supabase, orgId, userId)
  return role === 'owner' || role === 'admin'
}
