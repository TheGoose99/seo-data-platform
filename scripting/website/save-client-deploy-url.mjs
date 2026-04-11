/**
 * Persist deployment URL to Supabase `clients.website_deploy_url` (service role).
 */
import { createClient } from '@supabase/supabase-js'

/**
 * @param {string | undefined} clientId - UUID of `public.clients.id`
 * @param {string | undefined} deployUrl - HTTPS URL from Vercel deploy output
 * @returns {Promise<{ ok: boolean; skipped?: boolean; error?: string }>}
 */
export async function saveClientDeployUrl(clientId, deployUrl) {
  if (!clientId?.trim() || !deployUrl?.trim()) {
    return { ok: true, skipped: true }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.warn(
      'saveClientDeployUrl: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing — skipping DB update'
    )
    return { ok: false, skipped: true }
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { error } = await supabase
    .from('clients')
    .update({
      website_deploy_url: deployUrl.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', clientId.trim())

  if (error) {
    console.error('saveClientDeployUrl:', error.message)
    return { ok: false, error: error.message }
  }

  console.log('Saved website_deploy_url for client', clientId.slice(0, 8) + '…')
  return { ok: true }
}
