#!/usr/bin/env node
/**
 * Five sequential API runs (TOON-only user message). Requires ANTHROPIC_API_KEY.
 * Usage: npm run generate:toon:compare5
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { repoRoot, templatesDir, workspaceDir, tsxCliPath, runWithToonScriptPath } from './paths.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(workspaceDir, 'api-compare')
const TOON = path.join(templatesDir, 'toon.example.json')
const RUNNER = runWithToonScriptPath
const SUMMARIZER = path.join(__dirname, 'summarize-api-runs.mjs')

fs.mkdirSync(OUT_DIR, { recursive: true })

for (let i = 1; i <= 5; i++) {
  const out = path.join(OUT_DIR, `run-${i}.json`)
  console.error(`\n========== API run ${i}/5 → ${out} ==========\n`)
  const r = spawnSync(
    process.execPath,
    [tsxCliPath(), RUNNER, '--verbose', `--out=${out}`, TOON],
    {
      cwd: repoRoot,
      stdio: 'inherit',
      env: { ...process.env },
    }
  )
  if (r.status !== 0) {
    console.error(`Run ${i} failed with exit ${r.status}`)
    process.exit(r.status ?? 1)
  }
}

console.error('\n=== Summary ===\n')
spawnSync(process.execPath, [SUMMARIZER, OUT_DIR], { stdio: 'inherit', cwd: repoRoot })
