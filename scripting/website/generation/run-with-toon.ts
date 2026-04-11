#!/usr/bin/env npx tsx
/**
 * CloseBy: TOON → Claude → validate → merge with reference-client.seed.json
 *
 * Usage (from seo-data-platform repo root):
 *   npx tsx scripting/website/generation/run-with-toon.ts [--dry-run] [--verbose] [--text-fallback] [--client-id=<uuid>] [--out=path] path/to/clinic.toon
 *   (also accepts .json — same schema, parsed then encoded as TOON for the API)
 *
 * Env: ANTHROPIC_API_KEY, optional ANTHROPIC_MODEL (default claude-sonnet-4-20250514)
 * Loads .env.local from repo root if present.
 *
 * Token usage: writes <out>.usage.json; stderr JSON line `{"event":"anthropic.usage",...}`; logs to MongoDB `claude_api` when MONGODB_URI is set.
 */

import fs from 'node:fs'
import path from 'node:path'
import { toonInputSchema } from './schemas.mjs'
import { parseLlmPayload, repairLlmPayload } from './validate.mjs'
import { checkCohesion } from './cohesion.mjs'
import { mergeLlmIntoSeed } from './merge.mjs'
import {
  generateClientPayload,
  generateClientPayloadTextMode,
} from './claude-client.mjs'
import { loadToonDocument } from './toon-io.mjs'
import {
  repoRoot,
  defaultSeedPath,
  llmFixturePath,
  defaultMergedOutPath,
} from './paths.mjs'
import { insertClaudeApiUsage } from '../../../lib/mongodb/claude-api'
import { applyWebsiteBundleAfterMerge } from '../../../lib/website/apply-website-bundle'
import { mergeClientCalPublicFromDb } from '../../../lib/website/merge-client-cal-from-db'

function usageSidecarPath(outPath: string) {
  return outPath.replace(/\.json$/i, '') + '.usage.json'
}

function sumUsageFields(rows: Array<Record<string, number | undefined>>) {
  let input_tokens = 0
  let output_tokens = 0
  let cache_creation_input_tokens = 0
  let cache_read_input_tokens = 0
  for (const r of rows) {
    if (!r) continue
    input_tokens += r.input_tokens || 0
    output_tokens += r.output_tokens || 0
    cache_creation_input_tokens += r.cache_creation_input_tokens || 0
    cache_read_input_tokens += r.cache_read_input_tokens || 0
  }
  const out: Record<string, number> = { input_tokens, output_tokens }
  if (cache_creation_input_tokens) {
    out.cache_creation_input_tokens = cache_creation_input_tokens
  }
  if (cache_read_input_tokens) {
    out.cache_read_input_tokens = cache_read_input_tokens
  }
  return out
}

const DEFAULT_SEED = defaultSeedPath
const FIXTURE = llmFixturePath
const OUT_DEFAULT = defaultMergedOutPath

function loadEnvFile(p: string) {
  if (!fs.existsSync(p)) return
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m && process.env[m[1]] === undefined) {
      let v = m[2]
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1)
      }
      process.env[m[1]] = v
    }
  }
}

function applyLayoutOverride(
  payload: Record<string, unknown>,
  toon: { layoutOverride?: Record<string, string> }
): Record<string, unknown> {
  if (!toon.layoutOverride) return payload
  const layout = (payload.layout as Record<string, string> | undefined) ?? {}
  return {
    ...payload,
    layout: { ...layout, ...toon.layoutOverride },
  }
}

async function main() {
  loadEnvFile(path.join(repoRoot, '.env.local'))
  loadEnvFile(path.join(repoRoot, '.env'))

  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const verbose = argv.includes('--verbose')
  const textFallback = argv.includes('--text-fallback')
  const outArg = argv.find((a) => a.startsWith('--out='))
  const outPath = outArg ? outArg.slice('--out='.length) : OUT_DEFAULT
  const clientIdArg = argv.find((a) => a.startsWith('--client-id='))?.slice('--client-id='.length)
  const toonPath = argv.filter((a) => !a.startsWith('--'))[0]

  if (!toonPath) {
    console.error(
      'Usage: npx tsx scripting/website/generation/run-with-toon.ts [--dry-run] [--verbose] [--text-fallback] [--client-id=<uuid>] [--out=path] <clinic.toon|clinic.json>'
    )
    process.exit(1)
  }

  const toonRaw = loadToonDocument(path.resolve(toonPath))
  const toon = toonInputSchema.parse(toonRaw)

  const seed = JSON.parse(fs.readFileSync(DEFAULT_SEED, 'utf8'))

  let rawPayload: unknown
  const usageCalls: { step: string; model: string; usage: Record<string, number> }[] = []
  if (dryRun) {
    console.log('Dry-run: using llm-response.fixture.json (no API call)')
    rawPayload = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'))
  } else {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.error('Missing ANTHROPIC_API_KEY. Use --dry-run to test pipeline without API.')
      process.exit(1)
    }
    const model = process.env.ANTHROPIC_MODEL
    const resolvedModel = model || 'claude-sonnet-4-20250514'
    if (verbose) {
      console.error('Calling Anthropic', resolvedModel, '…')
    }
    const t0 = Date.now()
    try {
      const r = await generateClientPayload({
        apiKey,
        model,
        toon,
      })
      rawPayload = r.payload
      usageCalls.push({ step: 'tool', model: r.model, usage: r.usage as Record<string, number> })
      if (verbose) {
        console.error('usage', r.usage)
      }
    } catch (e) {
      if (textFallback) {
        console.warn('Tool mode failed, trying text mode:', e instanceof Error ? e.message : e)
        const r = await generateClientPayloadTextMode({
          apiKey,
          model,
          toon,
        })
        rawPayload = r.payload
        usageCalls.push({
          step: 'text_fallback',
          model: r.model,
          usage: r.usage as Record<string, number>,
        })
        if (verbose) {
          console.error('usage', r.usage)
        }
      } else {
        throw e
      }
    }
    if (verbose) {
      console.error(`API response OK in ${Date.now() - t0}ms`)
    }
  }

  let payload = applyLayoutOverride(
    repairLlmPayload(rawPayload) as Record<string, unknown>,
    toon
  )

  let parsed = parseLlmPayload(payload)
  if (!parsed.success && !dryRun && process.env.ANTHROPIC_API_KEY) {
    console.warn('Validation failed; retrying once with text mode…', parsed.error.flatten())
    const apiKey = process.env.ANTHROPIC_API_KEY
    const model = process.env.ANTHROPIC_MODEL
    const r = await generateClientPayloadTextMode({
      apiKey,
      model,
      toon,
    })
    rawPayload = r.payload
    usageCalls.push({ step: 'text_retry', model: r.model, usage: r.usage as Record<string, number> })
    if (verbose) {
      console.error('usage', r.usage)
    }
    payload = applyLayoutOverride(
      repairLlmPayload(rawPayload) as Record<string, unknown>,
      toon
    )
    parsed = parseLlmPayload(payload)
  }
  if (!parsed.success) {
    console.error('Validation failed:', parsed.error.flatten())
    process.exit(1)
  }
  payload = parsed.data

  const cohesion = checkCohesion(payload, {
    city: toon.city || seed.address?.city,
    sector: toon.sector || seed.address?.sector,
    shortName: toon.shortName || seed.shortName,
    name: toon.name || seed.name,
  })
  if (!cohesion.ok) {
    console.warn('Cohesion warnings (non-fatal):', cohesion.errors)
  }

  let merged = mergeLlmIntoSeed(seed, payload)
  if (clientIdArg) {
    const cal = await mergeClientCalPublicFromDb(merged, clientIdArg)
    if (!cal.ok) {
      console.error(cal.error)
      process.exit(1)
    }
    merged = cal.merged
    if (verbose) {
      console.error('Merged public Cal fields from Supabase clients row (mock bundle skipped).')
    }
  } else {
    merged = applyWebsiteBundleAfterMerge(merged)
    if (verbose) {
      console.error(
        'Applied mock Cal bundle (set --client-id + Supabase env to load public Cal from DB).'
      )
    }
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(merged, null, 2), 'utf8')
  console.log('Wrote', outPath)

  if (!dryRun && usageCalls.length > 0) {
    const totals = sumUsageFields(usageCalls.map((c) => c.usage))
    const record = {
      generatedAt: new Date().toISOString(),
      outPath: path.resolve(outPath),
      model: usageCalls[usageCalls.length - 1]?.model,
      calls: usageCalls,
      totals,
      script: 'run-with-toon.ts',
    }
    const sidecar = usageSidecarPath(outPath)
    fs.writeFileSync(sidecar, JSON.stringify(record, null, 2), 'utf8')
    console.log('Wrote', sidecar)
    console.error(
      JSON.stringify({
        event: 'anthropic.usage',
        input_tokens: totals.input_tokens,
        output_tokens: totals.output_tokens,
        calls: usageCalls.length,
      })
    )

    const mongo = await insertClaudeApiUsage(record)
    if (mongo.ok) {
      console.log('MongoDB: inserted claude_api', mongo.insertedId.toString())
    } else if (mongo.skipped && verbose) {
      console.error('MongoDB: skipped (MONGODB_URI unset)')
    } else if (mongo.error) {
      console.warn('MongoDB: insert failed:', mongo.error)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
