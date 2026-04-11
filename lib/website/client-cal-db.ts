/**
 * Supabase `clients` + `client_cal_secrets` shape for Cal (see migration 0006).
 * `cal_api_key` and `cal_webhook_secret` must never be copied into static ClientConfig / merged-client.json.
 */
import type { CalComSlugTriple } from './cal-types'

/** Public columns on `public.clients` */
export type ClientCalPublicRow = {
  cal_com_username: string | null
  cal_com_canonical_event_slugs: CalComSlugTriple | null
  cal_com_event_slugs: CalComSlugTriple | null
  /** Latest URL from website onboarding / Vercel deploy (migration 0007) */
  website_deploy_url: string | null
}

/** One row per client; RLS denies anon/auth — service_role only */
export type ClientCalSecretsRow = {
  client_id: string
  cal_api_key: string | null
  cal_webhook_secret: string | null
  updated_at: string
}
