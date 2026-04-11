/**
 * MongoDB persistence for Claude API usage analytics (collection `claude_api`).
 * Used by generation scripts and importable from Next.js server code.
 */
import { MongoClient, type ObjectId } from 'mongodb'

export const CLAUDE_API_COLLECTION = 'claude_api'

const DEFAULT_DB = 'seo_data_platform'

function resolveDbName(): string {
  return process.env.MONGODB_DB?.trim() || DEFAULT_DB
}

export type InsertClaudeApiResult =
  | { ok: true; insertedId: ObjectId }
  | { ok: false; skipped?: boolean; error?: string }

/**
 * Insert one usage document. No-op when `MONGODB_URI` is unset.
 */
export async function insertClaudeApiUsage(
  document: Record<string, unknown>
): Promise<InsertClaudeApiResult> {
  const uri = process.env.MONGODB_URI?.trim()
  if (!uri) {
    return { ok: false, skipped: true }
  }

  const dbName = resolveDbName()
  const collectionName =
    process.env.MONGODB_CLAUDE_COLLECTION?.trim() || CLAUDE_API_COLLECTION

  const client = new MongoClient(uri)
  try {
    await client.connect()
    const col = client.db(dbName).collection(collectionName)
    const doc = {
      createdAt: new Date(),
      ...document,
    }
    const result = await col.insertOne(doc)
    return { ok: true, insertedId: result.insertedId }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, error: msg }
  } finally {
    await client.close().catch(() => {})
  }
}
