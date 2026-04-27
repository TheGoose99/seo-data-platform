export function normalizePhone(raw) {
  const trimmed = String(raw ?? '').trim()
  if (!trimmed) return ''
  const cleaned = trimmed.replace(/[^\d+]/g, '')
  if (!cleaned) return ''
  if (cleaned.startsWith('00')) return `+${cleaned.slice(2)}`
  return cleaned
}

