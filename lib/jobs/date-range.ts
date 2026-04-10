export function lastNDaysRange(nDays: number): { startDate: string; endDate: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - (nDays - 1))

  const toISODate = (d: Date) => d.toISOString().slice(0, 10)
  return { startDate: toISODate(start), endDate: toISODate(end) }
}

export function enumerateDates(startDate: string, endDate: string): string[] {
  const out: string[] = []
  const start = new Date(`${startDate}T00:00:00Z`)
  const end = new Date(`${endDate}T00:00:00Z`)

  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

