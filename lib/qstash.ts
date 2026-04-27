type PublishOptions = {
  url: string
  body: unknown
  delaySeconds?: number
}

function getQstashToken(): string {
  const token = process.env.QSTASH_TOKEN?.trim()
  if (!token) throw new Error('Missing QSTASH_TOKEN')
  return token
}

export async function qstashPublishJson({ url, body, delaySeconds }: PublishOptions) {
  if (!/^https?:\/\//.test(url)) throw new Error(`QStash publish URL must be absolute: ${url}`)

  const qstashUrl = `https://qstash.upstash.io/v2/publish/${encodeURIComponent(url)}`
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getQstashToken()}`,
    'Content-Type': 'application/json',
  }

  const forwardSecret = process.env.QSTASH_FORWARD_SECRET?.trim()
  if (forwardSecret) {
    headers['Upstash-Forward-Authorization'] = `Bearer ${forwardSecret}`
  }

  if (delaySeconds && Number.isFinite(delaySeconds) && delaySeconds > 0) {
    headers['Upstash-Delay'] = `${Math.ceil(delaySeconds)}s`
  }

  const response = await fetch(qstashUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`QStash publish failed (${response.status}): ${text}`)
  }

  return response.json().catch(() => ({}))
}

export function getWorkerPublicUrl(pathname: string): string {
  const explicit = process.env.QSTASH_WORKER_URL?.trim()
  if (explicit && /^https?:\/\//.test(explicit)) return explicit

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (!siteUrl || !/^https?:\/\//.test(siteUrl)) {
    throw new Error('Missing NEXT_PUBLIC_SITE_URL or QSTASH_WORKER_URL for QStash publish destination')
  }
  return `${siteUrl.replace(/\/+$/, '')}${pathname}`
}

