import { llmClientPayloadSchema } from './schemas.mjs'

/** Mirrors schemas.mjs contentBlockSchema string maxima (heroChips excluded — array). */
const CONTENT_STRING_MAX = {
  heroTitle: 200,
  heroTitleAccent: 120,
  heroSubtitle: 600,
  heroCta: 80,
  heroCtaSecondary: 80,
  heroAvailability: 200,
  aboutTitle: 200,
  aboutEyebrow: 80,
  aboutTitleLead: 120,
  aboutTitleLine2: 120,
  aboutPullQuote: 500,
  servicesTitle: 120,
  servicesSubtitle: 400,
  faqTitle: 120,
  faqEyebrow: 80,
  faqSidebarLead: 120,
  faqSidebarEmphasis: 80,
  faqSidebarSubtitle: 300,
  reviewsTitle: 120,
  galleryTitle: 120,
  gallerySubtitle: 300,
  locationSaturdayNote: 200,
  heroBadgeFreeSession: 120,
}

function truncateSeo(seo) {
  if (!seo || typeof seo !== 'object') return seo
  const out = { ...seo }
  if (typeof out.metaTitle === 'string' && out.metaTitle.length > 70) {
    out.metaTitle = out.metaTitle.slice(0, 70)
  }
  if (typeof out.metaDescription === 'string' && out.metaDescription.length > 200) {
    out.metaDescription = out.metaDescription.slice(0, 200)
  }
  return out
}

function repairContentObject(c) {
  if (!c || typeof c !== 'object') return c
  const out = { ...c }
  for (const k of Object.keys(CONTENT_STRING_MAX)) {
    if (!(k in out)) out[k] = ''
    else if (typeof out[k] !== 'string') out[k] = String(out[k] ?? '')
  }
  for (const [k, max] of Object.entries(CONTENT_STRING_MAX)) {
    if (typeof out[k] === 'string' && out[k].length > max) {
      out[k] = out[k].slice(0, max)
    }
  }
  if (out.heroChips !== undefined && !Array.isArray(out.heroChips)) {
    delete out.heroChips
  }
  if (Array.isArray(out.heroChips)) {
    out.heroChips = out.heroChips.slice(0, 8).filter((x) => typeof x === 'string')
  }
  return out
}

/**
 * Normalize malformed tool output (stringified JSON, long SEO strings, etc.).
 */
export function repairLlmPayload(raw) {
  if (!raw || typeof raw !== 'object') return raw
  const o = { ...raw }

  if (typeof o.content === 'string') {
    try {
      const p = JSON.parse(o.content)
      if (p && typeof p === 'object' && !Array.isArray(p)) o.content = p
    } catch {
      /* leave */
    }
  }

  if (o.seo) o.seo = truncateSeo(o.seo)

  if (o.content && typeof o.content === 'object') {
    o.content = repairContentObject(o.content)
  }

  if (typeof o.faqs === 'string') {
    try {
      const p = JSON.parse(o.faqs)
      if (Array.isArray(p)) o.faqs = p
    } catch {
      /* leave */
    }
  }

  if (Array.isArray(o.faqs)) {
    o.faqs = o.faqs.map((item) => {
      if (!item || typeof item !== 'object') return item
      const q = { ...item }
      if (typeof q.question === 'string' && q.question.length > 400) {
        q.question = q.question.slice(0, 400)
      }
      if (typeof q.answer === 'string' && q.answer.length > 8000) {
        q.answer = q.answer.slice(0, 8000)
      }
      return q
    })
  }

  return o
}

export function parseLlmPayload(raw) {
  return llmClientPayloadSchema.safeParse(raw)
}
