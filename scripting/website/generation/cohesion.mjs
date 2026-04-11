export function checkCohesion(payload, context) {
  const errors = []
  const city = (context.city || '').trim()
  const sector = (context.sector || '').trim()
  const shortName = (context.shortName || context.name || '').trim()

  const blob = [
    payload.seo.metaTitle,
    payload.seo.metaDescription,
    ...payload.seo.keywords,
    payload.content.heroSubtitle,
    payload.content.heroAvailability,
    payload.content.aboutPullQuote,
    ...payload.faqs.flatMap((f) => [f.question, f.answer]),
  ].join(' ')

  if (city && !containsLoose(blob, city)) {
    errors.push(`City "${city}" should appear in meta, hero, or FAQs.`)
  }
  if (sector) {
    const sectorNorm = sector.replace(/^sector\s*/i, '').trim()
    if (!containsLoose(blob, sector) && !containsLoose(blob, sectorNorm)) {
      errors.push(`Sector "${sector}" should appear in copy or FAQs.`)
    }
  }
  if (shortName) {
    const first = shortName.split(/\s+/)[0] || shortName
    if (!containsLoose(blob, first)) {
      errors.push(`Practice name fragment "${first}" should appear in visible copy or meta.`)
    }
  }

  return errors.length ? { ok: false, errors } : { ok: true }
}

function containsLoose(hay, needle) {
  if (!needle) return true
  const a = hay.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
  const b = needle.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
  return a.includes(b)
}
