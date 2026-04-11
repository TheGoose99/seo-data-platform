import Anthropic from '@anthropic-ai/sdk'
import { encode } from '@toon-format/toon'

/**
 * API does not load closeby-agent-prompt.txt — that file is for Cursor/humans only.
 * Request payload = minimal system line + TOON user message + tool schema (submit_client_content).
 */
const API_SYSTEM_MINIMAL = `Call submit_client_content once. The user message is clinic data in TOON only. Match the tool schema exactly: layout a–f, seo metaTitle≤70 and metaDescription≤200 chars, content object with all string fields, faqs array 5–12. Romanian (ăâîșț) unless TOON says en. No fake reviews.`

export function getSystemPromptForApi() {
  return API_SYSTEM_MINIMAL
}

/**
 * Normalized token counts from `messages.create` (for analytics / cost tracking).
 * @param {{ usage?: object }} response
 */
export function extractUsageFromResponse(response) {
  const u = response?.usage
  if (!u || typeof u !== 'object') {
    return { input_tokens: 0, output_tokens: 0 }
  }
  const base = {
    input_tokens: Number(u.input_tokens) || 0,
    output_tokens: Number(u.output_tokens) || 0,
  }
  if (u.cache_creation_input_tokens != null) {
    base.cache_creation_input_tokens = Number(u.cache_creation_input_tokens) || 0
  }
  if (u.cache_read_input_tokens != null) {
    base.cache_read_input_tokens = Number(u.cache_read_input_tokens) || 0
  }
  return base
}

export function extractJsonFromMessage(content) {
  for (const block of content) {
    if (block.type === 'tool_use' && block.name === 'submit_client_content') {
      return block.input
    }
  }
  for (const block of content) {
    if (block.type === 'text') {
      const parsed = tryParseJson(block.text)
      if (parsed) return parsed
    }
  }
  throw new Error('Could not extract JSON from assistant response')
}

function tryParseJson(t) {
  const trimmed = t.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    /* continue */
  }
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) {
    try {
      return JSON.parse(fence[1].trim())
    } catch {
      /* continue */
    }
  }
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1))
    } catch {
      /* continue */
    }
  }
  return null
}

/** User message is only the clinic TOON payload (token-efficient). */
function buildUserMessage(toon) {
  return encode(toon)
}

const TOOL = {
  name: 'submit_client_content',
  description:
    'submit_client_content: layout (a–f per section), seo { metaTitle, metaDescription, keywords }, content (hero/about/services/faq block strings + heroChips), faqs []. No seo.title/h1, no content.faqs, no reviews. Use this tool only.',
  input_schema: {
    type: 'object',
    properties: {
      layout: { type: 'object', additionalProperties: false, properties: Object.fromEntries(
        ['header', 'hero', 'proof', 'about', 'services', 'reviews', 'faq', 'location', 'gallery'].map((k) => [
          k,
          { type: 'string', enum: ['a', 'b', 'c', 'd', 'e', 'f'] },
        ])
      ), required: ['header', 'hero', 'proof', 'about', 'services', 'reviews', 'faq', 'location', 'gallery'] },
      seo: {
        type: 'object',
        properties: {
          metaTitle: { type: 'string' },
          metaDescription: { type: 'string' },
          keywords: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 24 },
        },
        required: ['metaTitle', 'metaDescription', 'keywords'],
        additionalProperties: false,
      },
      content: {
        type: 'object',
        additionalProperties: true,
      },
      faqs: {
        type: 'array',
        minItems: 5,
        maxItems: 12,
        items: {
          type: 'object',
          properties: { question: { type: 'string' }, answer: { type: 'string' } },
          required: ['question', 'answer'],
          additionalProperties: false,
        },
      },
    },
    required: ['layout', 'seo', 'content', 'faqs'],
    additionalProperties: false,
  },
}

function samplingParams() {
  const t = process.env.ANTHROPIC_TEMPERATURE
  if (t === undefined || t === '') return {}
  const n = Number(t)
  if (Number.isNaN(n)) return {}
  return { temperature: n }
}

export async function generateClientPayload({ apiKey, model, toon }) {
  const anthropic = new Anthropic({ apiKey })
  const userText = buildUserMessage(toon)
  const resolvedModel = model || 'claude-sonnet-4-20250514'

  const response = await anthropic.messages.create({
    model: resolvedModel,
    max_tokens: 16384,
    system: getSystemPromptForApi(),
    tools: [TOOL],
    tool_choice: { type: 'tool', name: 'submit_client_content' },
    messages: [{ role: 'user', content: userText }],
    ...samplingParams(),
  })

  return {
    payload: extractJsonFromMessage(response.content),
    usage: extractUsageFromResponse(response),
    model: resolvedModel,
  }
}

/** Text-only fallback if tool_choice unsupported in environment */
export async function generateClientPayloadTextMode({ apiKey, model, toon }) {
  const anthropic = new Anthropic({ apiKey })
  const userText = `${buildUserMessage(toon)}\n\nReturn ONLY raw JSON. No markdown.`
  const resolvedModel = model || 'claude-sonnet-4-20250514'

  const response = await anthropic.messages.create({
    model: resolvedModel,
    max_tokens: 16384,
    system: getSystemPromptForApi(),
    messages: [{ role: 'user', content: userText }],
    ...samplingParams(),
  })

  return {
    payload: extractJsonFromMessage(response.content),
    usage: extractUsageFromResponse(response),
    model: resolvedModel,
  }
}
