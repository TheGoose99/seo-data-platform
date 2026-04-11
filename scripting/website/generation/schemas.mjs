/**
 * Zod schemas for CloseBy LLM output (maps to ClientConfig.content, layout, seo, faqs).
 * Reviews stay in seed — not generated.
 */
import { z } from 'zod'

export const hexVariantSchema = z.enum(['a', 'b', 'c', 'd', 'e', 'f'])

export const layoutSchema = z.object({
  header: hexVariantSchema,
  hero: hexVariantSchema,
  proof: hexVariantSchema,
  about: hexVariantSchema,
  services: hexVariantSchema,
  reviews: hexVariantSchema,
  faq: hexVariantSchema,
  location: hexVariantSchema,
  gallery: hexVariantSchema,
})

export const seoSchema = z.object({
  metaTitle: z.string().max(70),
  metaDescription: z.string().max(200),
  keywords: z.array(z.string()).min(4).max(24),
})

export const contentBlockSchema = z.object({
  heroTitle: z.string().max(200),
  heroTitleAccent: z.string().max(120),
  heroSubtitle: z.string().max(600),
  heroCta: z.string().max(80),
  heroCtaSecondary: z.string().max(80),
  heroAvailability: z.string().max(200),
  aboutTitle: z.string().max(200),
  aboutEyebrow: z.string().max(80),
  aboutTitleLead: z.string().max(120),
  aboutTitleLine2: z.string().max(120),
  aboutPullQuote: z.string().max(500),
  servicesTitle: z.string().max(120),
  servicesSubtitle: z.string().max(400),
  faqTitle: z.string().max(120),
  faqEyebrow: z.string().max(80),
  faqSidebarLead: z.string().max(120),
  faqSidebarEmphasis: z.string().max(80),
  faqSidebarSubtitle: z.string().max(300),
  reviewsTitle: z.string().max(120),
  galleryTitle: z.string().max(120),
  gallerySubtitle: z.string().max(300),
  locationSaturdayNote: z.string().max(200),
  heroBadgeFreeSession: z.string().max(120),
  heroChips: z.array(z.string()).max(8).optional(),
})

export const faqItemSchema = z.object({
  question: z.string().max(400),
  answer: z.string().max(8000),
})

export const llmClientPayloadSchema = z.object({
  layout: layoutSchema,
  seo: seoSchema,
  content: contentBlockSchema,
  faqs: z.array(faqItemSchema).min(5).max(12),
})

/** SEO rows from DataForSEO / research — canonical key: seoKeywordCandidates */
export const seoKeywordCandidateSchema = z.object({
  keyword: z.string(),
  volume: z.number().optional(),
  position: z.number().optional(),
  /** e.g. informational, transactional, local — helps merge into seo.keywords */
  intent: z.string().optional(),
})

const toonServiceItemSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  id: z.string().nullable().optional(),
  duration: z.number().nullable().optional(),
  price: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  calEventSlug: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  featured: z.boolean().nullable().optional(),
})

/**
 * Drives unique copy + layout variant choices per psychologist (one site generation = one primary profile).
 */
export const personalityProfileSchema = z.object({
  /** How they show up therapeutically — use for voice and metaphors */
  summary: z.string().optional(),
  /** Short traits (Romanian), e.g. "directă", "calmă", "structurată" */
  traits: z.array(z.string()).max(16).optional(),
  /** Macro tone for diction, rhythm, warmth */
  tone: z
    .enum([
      'warm_clinical',
      'warm_conversational',
      'structured_direct',
      'gentle_reflective',
      'energetic_supportive',
      'minimal_precise',
    ])
    .optional(),
  /** Site copy style: sentence length, metaphor, what to emphasize */
  voiceNotes: z.string().optional(),
  /** What makes this practice sound unlike any other */
  differentiators: z.array(z.string()).max(12).optional(),
  /** Words, tones, or clichés to avoid for this person */
  avoid: z.array(z.string()).max(12).optional(),
  /**
   * Guides layout hex picks (a–f) per section — combine with layoutOverride when present.
   */
  layoutVibe: z
    .enum([
      'trust_forward',
      'calm_minimal',
      'warm_expressive',
      'clinical_precise',
      'balanced',
    ])
    .optional(),
})

const toonBaseSchema = z
  .object({
    name: z.string().optional(),
    shortName: z.string().optional(),
    city: z.string().optional(),
    sector: z.string().optional(),
    language: z.enum(['ro', 'en']).optional(),
    /** "tu" | "dumneavoastra" — Romanian address form; default tu if omitted */
    formality: z.enum(['tu', 'dumneavoastra']).optional(),
    services: z.array(toonServiceItemSchema).optional(),
    therapists: z
      .array(
        z.object({
          name: z.string(),
          specializations: z.array(z.string()).optional(),
          credentials: z.array(z.string()).optional(),
          yearsOfExperience: z.number().optional(),
          /** Optional per-therapist hint; primary site voice is `personality` on the TOON root */
          personalityHint: z.string().optional(),
        })
      )
      .optional(),
    /** Primary psychologist voice + layout cues — fill per client for unique sites */
    personality: personalityProfileSchema.optional(),
    address: z.string().optional(),
    hours: z.string().optional(),
    mode: z.enum(['in-person', 'online', 'both']).optional(),
    languages: z.array(z.string()).optional(),
    seoKeywordCandidates: z.array(seoKeywordCandidateSchema).optional(),
    /** @deprecated use seoKeywordCandidates — merged at parse time */
    dataForSeoKeywords: z.array(seoKeywordCandidateSchema).optional(),
    /**
     * Partial layout: only listed section keys replace the model’s chosen variant
     * for that section (a–f). Unlisted sections use the model default.
     */
    layoutOverride: layoutSchema.partial().optional(),
    /** Operator metadata — not used to infer location or copy */
    sourceNotes: z
      .object({
        googleMapsReferenceUrl: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough()

/**
 * Normalize legacy alias and produce the object we encode for the LLM (single keyword list key).
 */
export function normalizeToonForPrompt(input) {
  const o =
    typeof input === 'object' && input !== null ? { ...input } : input
  if (!o || typeof o !== 'object') return o
  let merged = o.seoKeywordCandidates
  if (!merged?.length && o.dataForSeoKeywords?.length) {
    merged = o.dataForSeoKeywords
  }
  const next = { ...o }
  if (merged !== undefined) next.seoKeywordCandidates = merged
  delete next.dataForSeoKeywords
  return next
}

export const toonInputSchema = z.preprocess((val) => {
  const n = normalizeToonForPrompt(val)
  return n
}, toonBaseSchema)
