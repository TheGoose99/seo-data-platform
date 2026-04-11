/**
 * Vercel project `--name` must be lowercase alphanumeric + hyphens (see CLI limits).
 * Uses merged ClientConfig `slug` (marketing site path / client handle).
 */
export function sanitizeVercelProjectName(slug) {
  const s = String(slug || 'closeby-site')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return (s || 'closeby-site').slice(0, 100)
}

/**
 * Extract HTTPS deployment URL from `vercel deploy` stdout/stderr (JSON block).
 */
export function parseVercelDeploymentUrl(combinedOutput) {
  const text = String(combinedOutput || '')
  const m = text.match(
    /"deployment"\s*:\s*\{[\s\S]*?"url"\s*:\s*"(https:\/\/[^"]+)"/
  )
  if (m) return m[1]
  const line = text.match(/Preview:\s*(https:\/\/[^\s]+)/i)
  if (line) return line[1].replace(/[\],}\)]+$/, '')
  const prod = text.match(/Production:\s*(https:\/\/[^\s]+)/i)
  if (prod) return prod[1].replace(/[\],}\)]+$/, '')
  return null
}
