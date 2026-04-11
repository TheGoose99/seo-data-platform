import { applySeoLayer, alignSeoWithSeed } from './seo-layer.mjs'

/**
 * Merge validated LLM payload into seed ClientConfig JSON.
 * Overwrites: layout, seo, content, faqs only.
 */
export function mergeLlmIntoSeed(seed, payload) {
  const out = structuredClone(seed)
  out.layout = { ...out.layout, ...payload.layout }
  let seoMerged = applySeoLayer(payload.seo)
  seoMerged = alignSeoWithSeed(seed, seoMerged)
  out.seo = { ...out.seo, ...seoMerged }
  out.content = { ...out.content, ...payload.content }
  out.faqs = payload.faqs
  return out
}
