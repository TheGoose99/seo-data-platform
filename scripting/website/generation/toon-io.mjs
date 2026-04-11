/**
 * Load clinic TOON input: `.toon` (Token-Oriented Object Notation) or `.json` (same data model).
 */
import fs from 'node:fs'
import { decode } from '@toon-format/toon'

export function loadToonDocument(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const lower = filePath.toLowerCase()
  if (lower.endsWith('.toon')) {
    return decode(raw)
  }
  return JSON.parse(raw)
}
