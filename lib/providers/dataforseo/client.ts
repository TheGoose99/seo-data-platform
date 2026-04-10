type DataForSeoTask<T> = { id?: string; status_code?: number; status_message?: string; result?: T[] }

export async function dataForSeoRequest<T>(path: string, payload: unknown): Promise<T> {
  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD
  if (!login || !password) throw new Error('Missing DATAFORSEO_LOGIN/DATAFORSEO_PASSWORD')

  const auth = Buffer.from(`${login}:${password}`, 'utf8').toString('base64')
  const res = await fetch(`https://api.dataforseo.com${path}`, {
    method: 'POST',
    headers: {
      authorization: `Basic ${auth}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error(`DataForSEO request failed: ${await res.text()}`)
  const json = (await res.json()) as { tasks?: Array<DataForSeoTask<T>> }

  const task = json.tasks?.[0]
  if (!task) throw new Error('DataForSEO: missing tasks[0]')
  if (task.status_code && task.status_code !== 20000) {
    throw new Error(`DataForSEO: ${task.status_code} ${task.status_message ?? ''}`.trim())
  }

  const result = task.result?.[0] as unknown as T
  return result
}

