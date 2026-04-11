const META_TITLE_TARGET = 60
const META_DESC_TARGET = 155
/** Must stay within llmClientPayloadSchema / site limits */
const META_TITLE_HARD = 70
const META_DESC_HARD = 200

export function applySeoLayer(seo) {
  const metaTitle = softTruncate(seo.metaTitle, META_TITLE_TARGET)
  const metaDescription = softTruncate(seo.metaDescription, META_DESC_TARGET)
  const keywords = dedupeKeywords(seo.keywords).slice(0, 24)
  return { ...seo, metaTitle, metaDescription, keywords }
}

/**
 * Ensure homepage seo names the same practice as the merged seed (brand + locality in keywords).
 */
export function alignSeoWithSeed(seed, seo) {
  const brand = (seed.shortName || seed.name || '').trim()
  const city = (seed.address?.city || '').trim()
  let metaTitle = seo.metaTitle
  let metaDescription = seo.metaDescription
  let keywords = [...seo.keywords]

  if (brand && !normIncludes(metaTitle, brand)) {
    metaTitle = softTruncate(`${brand} | ${metaTitle}`, META_TITLE_HARD)
  }
  if (brand && !normIncludes(metaDescription, brand)) {
    metaDescription = softTruncate(`${metaDescription} ${brand}.`, META_DESC_HARD)
  }
  if (brand && city && !keywords.some((k) => normIncludes(k, brand))) {
    keywords = dedupeKeywords([`${brand} ${city}`.toLowerCase(), ...keywords]).slice(
      0,
      24
    )
  }

  return { ...seo, metaTitle, metaDescription, keywords }
}

function normIncludes(hay, needle) {
  if (!needle) return true
  const a = norm(hay)
  const b = norm(needle)
  return a.includes(b)
}

function norm(s) {
  return s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
}

function softTruncate(s, max) {
  if (s.length <= max) return s
  const cut = s.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut).trim() + '…'
}

function dedupeKeywords(arr) {
  const seen = new Set()
  const out = []
  for (const k of arr) {
    const key = k.trim().toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(k.trim())
  }
  return out
}
