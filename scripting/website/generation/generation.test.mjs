import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {
  normalizeToonForPrompt,
  toonInputSchema,
  llmClientPayloadSchema,
} from './schemas.mjs'
import { parseLlmPayload, repairLlmPayload } from './validate.mjs'
import { mergeLlmIntoSeed } from './merge.mjs'
import { loadToonDocument } from './toon-io.mjs'
import { templatesDir } from './paths.mjs'

test('normalizeToonForPrompt merges legacy dataForSeoKeywords', () => {
  const n = normalizeToonForPrompt({
    shortName: 'X',
    dataForSeoKeywords: [{ keyword: 'a', intent: 'local' }],
  })
  assert.equal(n.dataForSeoKeywords, undefined)
  assert.deepEqual(n.seoKeywordCandidates, [{ keyword: 'a', intent: 'local' }])
})

test('toonInputSchema.parse accepts .json example file', () => {
  const raw = JSON.parse(
    fs.readFileSync(
      path.join(templatesDir, 'toon.example.json'),
      'utf8'
    )
  )
  const parsed = toonInputSchema.parse(raw)
  assert.ok(parsed.seoKeywordCandidates?.length >= 4)
  assert.equal(parsed.formality, 'tu')
  assert.equal(parsed.personality?.tone, 'warm_clinical')
  assert.ok(parsed.personality?.traits?.length)
})

test('loadToonDocument reads .toon and matches json parse', () => {
  const fromJson = toonInputSchema.parse(
    loadToonDocument(path.join(templatesDir, 'toon.example.json'))
  )
  const fromToon = toonInputSchema.parse(
    loadToonDocument(path.join(templatesDir, 'toon.example.toon'))
  )
  assert.deepEqual(fromJson.seoKeywordCandidates, fromToon.seoKeywordCandidates)
})

test('repairLlmPayload parses stringified faqs', () => {
  const fixture = JSON.parse(
    fs.readFileSync(
      path.join(templatesDir, 'llm-response.fixture.json'),
      'utf8'
    )
  )
  fixture.faqs = JSON.stringify(fixture.faqs)
  const fixed = repairLlmPayload(fixture)
  assert.ok(Array.isArray(fixed.faqs))
  const p = parseLlmPayload(fixed)
  assert.ok(p.success)
})

test('fixture + merge round-trip validates', () => {
  const fixture = JSON.parse(
    fs.readFileSync(
      path.join(templatesDir, 'llm-response.fixture.json'),
      'utf8'
    )
  )
  const parsed = parseLlmPayload(fixture)
  assert.ok(parsed.success)
  const seed = JSON.parse(
    fs.readFileSync(
      path.join(templatesDir, 'reference-client.seed.json'),
      'utf8'
    )
  )
  const merged = mergeLlmIntoSeed(seed, llmClientPayloadSchema.parse(fixture))
  assert.ok(merged.content.heroTitle)
  assert.ok(merged.seo.keywords.length >= 4)
  assert.match(merged.seo.metaTitle, /Ionescu/i)
  assert.ok(merged.seo.keywords.some((k) => /ionescu/i.test(k)))
})
