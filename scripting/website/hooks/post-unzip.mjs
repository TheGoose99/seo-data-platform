#!/usr/bin/env node
/**
 * After template unzip, copy merged ClientConfig JSON into the Next app.
 *
 * Args: [appRoot, runId]
 * Env:
 *   MERGED_CLIENT_PATH — absolute path to merged-client.json (set by onboard-client.mjs)
 *   MERGED_CLIENT_DEST — optional relative path inside app (default: config/clients/merged-client.json)
 */
import fs from 'node:fs'
import path from 'node:path'

const [appRoot, runId] = process.argv.slice(2)
const src = process.env.MERGED_CLIENT_PATH
const destRel = process.env.MERGED_CLIENT_DEST || 'config/clients/merged-client.json'

if (!appRoot) {
  console.error('[post-unzip] Missing appRoot')
  process.exit(1)
}

if (!src || !fs.existsSync(src)) {
  console.warn('[post-unzip] MERGED_CLIENT_PATH not set or file missing — skipping copy', src || '')
  process.exit(0)
}

const dest = path.join(appRoot, destRel)
fs.mkdirSync(path.dirname(dest), { recursive: true })
fs.copyFileSync(src, dest)
console.log(`[post-unzip] Copied merged client → ${dest} (runId=${runId || 'n/a'})`)
