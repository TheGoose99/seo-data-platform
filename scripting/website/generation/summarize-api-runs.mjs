#!/usr/bin/env node
/**
 * Compare merged-client JSON files from batch API runs (e.g. api-compare/run-1.json).
 * Usage: node scripting/website/generation/summarize-api-runs.mjs [dir]
 * Default dir: scripting/website/workspace/api-compare
 */
import fs from 'node:fs'
import path from 'node:path'
import { workspaceDir } from './paths.mjs'

const DEFAULT_DIR = path.join(workspaceDir, 'api-compare')

function pick(obj, pathStr) {
  return pathStr.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj)
}

function main() {
  const dir = path.resolve(process.argv[2] || DEFAULT_DIR)
  if (!fs.existsSync(dir)) {
    console.error('Directory not found:', dir)
    process.exit(1)
  }
  const files = fs
    .readdirSync(dir)
    .filter((f) => /^run-\d+\.json$/.test(f))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)?.[0] || '0', 10)
      const nb = parseInt(b.match(/\d+/)?.[0] || '0', 10)
      return na - nb
    })
  if (!files.length) {
    console.error('No run-*.json in', dir)
    process.exit(1)
  }

  const rows = []
  for (const f of files) {
    const p = path.join(dir, f)
    const j = JSON.parse(fs.readFileSync(p, 'utf8'))
    const layout = j.layout || {}
    const layoutSig = ['header', 'hero', 'proof', 'about', 'services', 'reviews', 'faq', 'location', 'gallery']
      .map((k) => layout[k] || '?')
      .join('')
    rows.push({
      file: f,
      metaTitle: (j.seo?.metaTitle || '').slice(0, 72),
      metaLen: (j.seo?.metaTitle || '').length,
      descLen: (j.seo?.metaDescription || '').length,
      kwCount: j.seo?.keywords?.length ?? 0,
      hero: `${pick(j, 'content.heroTitle') || ''} / ${pick(j, 'content.heroTitleAccent') || ''}`.slice(0, 80),
      faqCount: j.faqs?.length ?? 0,
      layoutSig,
      aboutTitle: (pick(j, 'content.aboutTitle') || '').slice(0, 50),
    })
  }

  console.log('\n=== CloseBy API batch comparison ===\n')
  for (const r of rows) {
    console.log(`--- ${r.file} ---`)
    console.log('metaTitle:', r.metaTitle)
    console.log('metaTitle len:', r.metaLen, '| metaDescription len:', r.descLen, '| keywords:', r.kwCount, '| FAQs:', r.faqCount)
    console.log('layout a–f:', r.layoutSig)
    console.log('hero (title / accent):', r.hero)
    console.log('aboutTitle:', r.aboutTitle)
    console.log('')
  }

  const titles = rows.map((r) => r.metaTitle)
  const uniqueTitles = new Set(titles)
  const layoutSigs = new Set(rows.map((r) => r.layoutSig))
  console.log('--- Summary ---')
  console.log('Runs:', rows.length)
  console.log('Unique metaTitles:', uniqueTitles.size, '/', rows.length)
  console.log('Unique layout signatures:', layoutSigs.size, '/', rows.length)
  if (uniqueTitles.size === rows.length) {
    console.log('All titles differ (good variance).')
  } else {
    console.log('Some metaTitles repeated — expected occasionally with low temperature.')
  }
}

main()
