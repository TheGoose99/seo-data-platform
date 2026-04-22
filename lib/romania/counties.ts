export const ROMANIAN_COUNTIES = [
  'Alba',
  'Arad',
  'Argeș',
  'Bacău',
  'Bihor',
  'Bistrița-Năsăud',
  'Botoșani',
  'Brăila',
  'Brașov',
  'București',
  'Buzău',
  'Călărași',
  'Caraș-Severin',
  'Cluj',
  'Constanța',
  'Covasna',
  'Dâmbovița',
  'Dolj',
  'Galați',
  'Giurgiu',
  'Gorj',
  'Harghita',
  'Hunedoara',
  'Ialomița',
  'Iași',
  'Ilfov',
  'Maramureș',
  'Mehedinți',
  'Mureș',
  'Neamț',
  'Olt',
  'Prahova',
  'Sălaj',
  'Satu Mare',
  'Sibiu',
  'Suceava',
  'Teleorman',
  'Timiș',
  'Tulcea',
  'Vâlcea',
  'Vaslui',
  'Vrancea',
] as const

export type RomanianCounty = (typeof ROMANIAN_COUNTIES)[number]

export function stripDiacritics(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ș/g, 's')
    .replace(/ț/g, 't')
    .replace(/ă/g, 'a')
    .replace(/î/g, 'i')
    .replace(/â/g, 'a')
    .replace(/Ș/g, 'S')
    .replace(/Ț/g, 'T')
    .replace(/Ă/g, 'A')
    .replace(/Î/g, 'I')
    .replace(/Â/g, 'A')
}

export function normalizeCountyName(raw: string) {
  return stripDiacritics(raw).toLowerCase().trim().replace(/\s+/g, ' ')
}

/**
 * Attempts to map a Google Places administrative_area_level_1 string to a Romanian county.
 * Handles common suffixes/prefixes and English variants (e.g. "Cluj County").
 */
export function matchRomanianCounty(raw: string | null | undefined): RomanianCounty | null {
  const t = (raw ?? '').trim()
  if (!t) return null
  const n = normalizeCountyName(t)
    .replace(/\bjudetul\b/g, '')
    .replace(/\bjude?țul\b/g, '')
    .replace(/\bcounty\b/g, '')
    .replace(/\bromania\b/g, '')
    .replace(/[(),]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')

  for (const c of ROMANIAN_COUNTIES) {
    if (normalizeCountyName(c) === n) return c
  }

  // last-resort substring match (e.g. "Județul Cluj" -> "cluj")
  for (const c of ROMANIAN_COUNTIES) {
    const cn = normalizeCountyName(c)
    if (n === cn) return c
    if (n.includes(cn)) return c
  }

  return null
}

