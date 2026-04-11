/**
 * Path helpers: this file is `scripting/website/generation/paths.mjs`.
 * - `websiteScriptingDir` = `scripting/website` (one level up)
 * - `repoRoot` = seo-data-platform root (three levels up)
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** `scripting/website` */
export const websiteScriptingDir = path.join(__dirname, '..')

/** seo-data-platform repository root */
export const repoRoot = path.join(__dirname, '../..', '..')

export const templatesDir = path.join(websiteScriptingDir, 'templates')
export const workspaceDir = path.join(websiteScriptingDir, 'workspace')

export const defaultSeedPath = path.join(templatesDir, 'reference-client.seed.json')
export const llmFixturePath = path.join(templatesDir, 'llm-response.fixture.json')
export const defaultMergedOutPath = path.join(workspaceDir, 'merged-client.json')

export function onboardingMergedPath(runId) {
  return path.join(workspaceDir, 'onboarding', runId, 'merged-client.json')
}

/** `tsx` CLI — used to run `run-with-toon.ts` (imports app `lib/mongodb`). */
export function tsxCliPath() {
  return path.join(repoRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs')
}

export const runWithToonScriptPath = path.join(
  websiteScriptingDir,
  'generation/run-with-toon.ts'
)
