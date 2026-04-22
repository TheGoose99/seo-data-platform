"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { onboardingIntakeSchema, type OnboardingIntake } from '@/lib/validation/onboarding-intake'
import { matchRomanianCounty } from '@/lib/romania/counties'
import { normalizeClientSlug } from '@/lib/clients/text'

type Props = { orgId: string }

type Prediction = { description: string; placeId: string }

const PRESET_SERVICES: Array<{ name: string; durationMinutes: number }> = [
  { name: 'Terapie individuală', durationMinutes: 50 },
  { name: 'Terapie de cuplu', durationMinutes: 80 },
  { name: 'Terapie copii / adolescenți', durationMinutes: 50 },
  { name: 'Evaluare psihologică', durationMinutes: 90 },
  { name: 'Ședință online', durationMinutes: 50 },
]

const PRESET_SPECIALTIES = [
  'Anxietate',
  'Depresie',
  'Terapie de cuplu',
  'Traumă',
  'Atacuri de panică',
  'ADHD (evaluare/consiliere)',
  'Burnout',
  'Stres',
  'Doliu',
  'Probleme de somn',
]

function clsx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function maskSecret(s: string | undefined) {
  if (!s?.trim()) return ''
  const t = s.trim()
  if (t.length <= 8) return '••••'
  return `${'•'.repeat(Math.min(24, t.length - 4))}${t.slice(-4)}`
}

function parseSeedKeywords(raw: string) {
  return raw
    .split(/[\n,]/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s, i, arr) => arr.findIndex((x) => x.toLowerCase() === s.toLowerCase()) === i)
    .slice(0, 30)
}

export function PsychologistIntakeForm({ orgId }: Props) {
  const [step, setStep] = useState(1)
  const [status, setStatus] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [displayName, setDisplayName] = useState('')
  const [legalType, setLegalType] = useState<'CIP' | 'SRL' | 'CLINICA' | ''>('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [addressText, setAddressText] = useState('')
  const [placeId, setPlaceId] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [countyRaw, setCountyRaw] = useState<string | null>(null)
  const [locality, setLocality] = useState<string | null>(null)
  const county = useMemo(() => matchRomanianCounty(countyRaw), [countyRaw])

  const [addrQuery, setAddrQuery] = useState('')
  const [addrPredictions, setAddrPredictions] = useState<Prediction[]>([])
  const [addrOpen, setAddrOpen] = useState(false)
  const [addrLoading, setAddrLoading] = useState(false)
  const [addrError, setAddrError] = useState<string | null>(null)

  const [languageMode, setLanguageMode] = useState<'ro' | 'ro_en'>('ro')
  const [otherLanguagesNotes, setOtherLanguagesNotes] = useState('')
  const [hasOldWebsite, setHasOldWebsite] = useState(false)
  const [oldWebsiteUrl, setOldWebsiteUrl] = useState('')
  const [domain, setDomain] = useState('')
  const [wantsDomainMigration, setWantsDomainMigration] = useState(false)
  const [dnsAccessAvailable, setDnsAccessAvailable] = useState<boolean>(false)

  const [services, setServices] = useState<Array<{ name: string; durationMinutes?: number; priceRon: number | null }>>(
    [],
  )
  const [customServiceName, setCustomServiceName] = useState('')
  const [customServiceDuration, setCustomServiceDuration] = useState<string>('')
  const [customServicePrice, setCustomServicePrice] = useState<string>('')

  const [specialties, setSpecialties] = useState<string[]>([])
  const [customSpecialty, setCustomSpecialty] = useState('')

  const [automationMode, setAutomationMode] = useState<'passive' | 'whatsapp' | 'calcom'>('passive')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [calUsername, setCalUsername] = useState('')
  const [calApiKey, setCalApiKey] = useState('')
  const [revealCalKey, setRevealCalKey] = useState(false)

  const [clientGoogleAccountEmail, setClientGoogleAccountEmail] = useState('')
  const [profileExists, setProfileExists] = useState<boolean>(true)
  const [profileClaimed, setProfileClaimed] = useState<boolean>(true)
  const [gbpMapsUrl, setGbpMapsUrl] = useState('')
  const [gbpOperatorEmail, setGbpOperatorEmail] = useState('')
  const [gbpVerificationExpected, setGbpVerificationExpected] = useState<
    'unknown' | 'postcard' | 'phone' | 'video'
  >('unknown')

  const [seedKeywordsRaw, setSeedKeywordsRaw] = useState('')
  const [keywordsApproved, setKeywordsApproved] = useState(false)

  function parseLegalType(v: string): 'CIP' | 'SRL' | 'CLINICA' | '' {
    if (v === 'CIP' || v === 'SRL' || v === 'CLINICA') return v
    return ''
  }

  function parseLanguageMode(v: string): 'ro' | 'ro_en' {
    return v === 'ro_en' ? 'ro_en' : 'ro'
  }

  function parseVerificationExpected(v: string): 'unknown' | 'postcard' | 'phone' | 'video' {
    if (v === 'postcard' || v === 'phone' || v === 'video') return v
    return 'unknown'
  }

  const intake: OnboardingIntake = useMemo(
    () => ({
      orgId,
      debugOnly: true,
      client: {
        displayName,
        legalType: legalType || undefined,
        email,
        phone,
      },
      location: {
        addressText,
        placeId,
        lat: lat ?? Number.NaN,
        lng: lng ?? Number.NaN,
        // Keep invalid until derived from Places (do not silently default).
        county: (county ?? ('UNKNOWN' as unknown as OnboardingIntake['location']['county'])) as OnboardingIntake['location']['county'],
        countyRaw: countyRaw ?? undefined,
        locality: locality ?? undefined,
      },
      website: {
        languageMode,
        otherLanguagesNotes: otherLanguagesNotes.trim() ? otherLanguagesNotes.trim() : undefined,
        hasOldWebsite,
        oldWebsiteUrl: oldWebsiteUrl.trim() ? oldWebsiteUrl.trim() : undefined,
        domain: domain.trim() ? domain.trim() : undefined,
        wantsDomainMigration,
        dnsAccessAvailable,
      },
      services: services
        .filter((s) => s.name.trim())
        .map((s) => ({
          name: s.name.trim(),
          durationMinutes: s.durationMinutes,
          priceRon: s.priceRon ?? Number.NaN,
        })),
      specialties,
      automation: {
        mode: automationMode,
        whatsappNumber: whatsappNumber.trim() ? whatsappNumber.trim() : undefined,
        calUsername: calUsername.trim() ? calUsername.trim() : undefined,
        calApiKey: calApiKey.trim() ? calApiKey.trim() : undefined,
        timezone: 'Europe/Bucharest',
      },
      gbp: {
        clientGoogleAccountEmail: clientGoogleAccountEmail.trim() ? clientGoogleAccountEmail.trim() : undefined,
        profileExists,
        profileClaimed: profileExists ? profileClaimed : undefined,
        mapsUrl: gbpMapsUrl.trim() ? gbpMapsUrl.trim() : undefined,
        placeId: placeId.trim() ? placeId.trim() : undefined,
        operatorAccessEmail: gbpOperatorEmail.trim() ? gbpOperatorEmail.trim() : undefined,
        verificationExpected: gbpVerificationExpected,
      },
      keywords: {
        seedKeywords: parseSeedKeywords(seedKeywordsRaw),
        approvedByOperator: keywordsApproved,
      },
    }),
    [
      addressText,
      automationMode,
      calApiKey,
      calUsername,
      clientGoogleAccountEmail,
      county,
      countyRaw,
      displayName,
      dnsAccessAvailable,
      domain,
      email,
      gbpMapsUrl,
      gbpOperatorEmail,
      gbpVerificationExpected,
      hasOldWebsite,
      keywordsApproved,
      languageMode,
      lat,
      legalType,
      lng,
      locality,
      oldWebsiteUrl,
      orgId,
      otherLanguagesNotes,
      phone,
      placeId,
      profileClaimed,
      profileExists,
      seedKeywordsRaw,
      services,
      specialties,
      wantsDomainMigration,
      whatsappNumber,
    ],
  )

  const intakeMasked = useMemo(() => {
    const clone = JSON.parse(JSON.stringify(intake)) as OnboardingIntake
    if (clone.automation?.calApiKey) clone.automation.calApiKey = maskSecret(clone.automation.calApiKey)
    return clone
  }, [intake])

  const validation = useMemo(() => onboardingIntakeSchema.safeParse(intake), [intake])

  const addrQueryRef = useRef('')
  addrQueryRef.current = addrQuery

  useEffect(() => {
    const q = addrQuery.trim()
    if (q.length < 3) {
      setAddrPredictions([])
      setAddrError(null)
      return
    }

    let cancelled = false
    const t = setTimeout(async () => {
      setAddrLoading(true)
      setAddrError(null)
      try {
        const res = await fetch('/api/google/places/autocomplete', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ orgId, input: q, language: 'ro', region: 'ro' }),
        })
        const json = (await res.json()) as { predictions?: Prediction[]; error?: string }
        if (cancelled) return
        if (!res.ok) {
          setAddrError(json.error ?? 'Autocomplete failed')
          setAddrPredictions([])
          return
        }
        setAddrPredictions(json.predictions ?? [])
        setAddrOpen(true)
      } catch (e) {
        if (cancelled) return
        setAddrError(e instanceof Error ? e.message : String(e))
        setAddrPredictions([])
      } finally {
        if (!cancelled) setAddrLoading(false)
      }
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [addrQuery, orgId])

  async function selectPrediction(predPlaceId: string, description: string) {
    setAddrOpen(false)
    setAddrError(null)
    setAddressText(description)
    setAddrQuery(description)
    setPlaceId(predPlaceId)
    try {
      const res = await fetch('/api/google/places/details', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orgId, placeId: predPlaceId, language: 'ro' }),
      })
      const json = (await res.json()) as {
        formattedAddress?: string | null
        lat?: number
        lng?: number
        locality?: string | null
        region?: string | null
        error?: string
      }
      if (!res.ok) {
        setAddrError(json.error ?? 'Failed to load address details')
        return
      }
      if (json.formattedAddress) {
        setAddressText(json.formattedAddress)
        setAddrQuery(json.formattedAddress)
      }
      if (json.lat != null && json.lng != null) {
        setLat(json.lat)
        setLng(json.lng)
      }
      setLocality(json.locality ?? null)
      setCountyRaw(json.region ?? null)
    } catch (e) {
      setAddrError(e instanceof Error ? e.message : String(e))
    }
  }

  function toggleSpecialty(label: string) {
    setSpecialties((prev) => (prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]))
  }

  function addCustomSpecialty() {
    const t = customSpecialty.trim()
    if (!t) return
    setSpecialties((prev) => (prev.includes(t) ? prev : [...prev, t]))
    setCustomSpecialty('')
  }

  function addPresetService(svc: { name: string; durationMinutes: number }) {
    setServices((prev) => {
      if (prev.some((x) => x.name.toLowerCase() === svc.name.toLowerCase())) return prev
      return [...prev, { name: svc.name, durationMinutes: svc.durationMinutes, priceRon: null }]
    })
  }

  function removeService(name: string) {
    setServices((prev) => prev.filter((s) => s.name !== name))
  }

  function addCustomService() {
    const name = customServiceName.trim()
    if (!name) return
    const duration = customServiceDuration.trim() ? Number(customServiceDuration) : undefined
    const price = customServicePrice.trim() ? Number(customServicePrice) : NaN
    if (!Number.isFinite(price)) return

    setServices((prev) => [
      ...prev,
      { name, durationMinutes: Number.isFinite(duration) ? duration : undefined, priceRon: price },
    ])
    setCustomServiceName('')
    setCustomServiceDuration('')
    setCustomServicePrice('')
  }

  function setServicePrice(name: string, raw: string) {
    const n = raw.trim() ? Number(raw) : NaN
    setServices((prev) => prev.map((s) => (s.name === name ? { ...s, priceRon: Number.isFinite(n) ? n : null } : s)))
  }

  function validateCurrentStep(): boolean {
    setStatus(null)
    setErrors({})

    const parsed = onboardingIntakeSchema.safeParse(intake)
    if (parsed.success) return true

    // Only show relevant errors per step to avoid noise.
    const stepFields: Record<number, string[]> = {
      1: ['client', 'location'],
      2: ['services', 'specialties', 'website'],
      3: ['automation', 'gbp', 'keywords'],
      4: [],
    }
    const allow = stepFields[step] ?? []
    const nextErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const root = String(issue.path[0] ?? '')
      if (allow.length > 0 && !allow.includes(root)) continue
      nextErrors[issue.path.join('.')] = issue.message
    }
    setErrors(nextErrors)
    setStatus('Verifică câmpurile marcate.')
    return Object.keys(nextErrors).length === 0
  }

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(intakeMasked, null, 2))
      setStatus('JSON copiat în clipboard.')
      setTimeout(() => setStatus(null), 1200)
    } catch {
      setStatus('Nu am putut copia JSON.')
    }
  }

  const slugPreview = useMemo(() => normalizeClientSlug(displayName || ''), [displayName])

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Onboarding cabinet (debug)</h2>
            <p className="mt-1 text-sm text-slate-400">
              Finalul afișează payload-ul complet (JSON). Nu se salvează în Supabase și nu rulează scripturi.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Step <span className="text-slate-200">{step}</span> / 4
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-slate-200">Identitate & locație</h3>
              <p className="mt-1 text-sm text-slate-500">Date de contact + adresa (Google Places) pentru coordonate.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-200">Nume cabinet / psiholog</label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="ex: Cabinet Psihologie Dr. Maria Ionescu"
                />
                {displayName.trim() ? (
                  <p className="text-xs text-slate-500">
                    Slug propus: <span className="font-mono text-emerald-300">{slugPreview}</span>
                  </p>
                ) : null}
                {errors['client.displayName'] ? <p className="text-xs text-rose-300">{errors['client.displayName']}</p> : null}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-200">Tip entitate (opțional)</label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  value={legalType}
                  onChange={(e) => setLegalType(parseLegalType(e.target.value))}
                >
                  <option value="">—</option>
                  <option value="CIP">CIP — Cabinet Individual Psiholog</option>
                  <option value="SRL">SRL</option>
                  <option value="CLINICA">Clinică / Centru</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-200">Email</label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  inputMode="email"
                  placeholder="contact@…"
                />
                {errors['client.email'] ? <p className="text-xs text-rose-300">{errors['client.email']}</p> : null}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-200">Telefon</label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  placeholder="ex: 07xx xxx xxx"
                />
                {errors['client.phone'] ? <p className="text-xs text-rose-300">{errors['client.phone']}</p> : null}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Adresă (Google Places)</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={addressText}
                onChange={(e) => {
                  setAddressText(e.target.value)
                  setAddrQuery(e.target.value)
                  setAddrOpen(true)
                }}
                onFocus={() => {
                  setAddrQuery(addressText)
                  setAddrOpen(true)
                }}
                onBlur={() => setTimeout(() => setAddrOpen(false), 120)}
                placeholder="Începe să scrii și alege o sugestie…"
              />
              {addrOpen && (addrPredictions.length > 0 || addrLoading || addrError) ? (
                <div className="relative">
                  <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-lg">
                    {addrLoading ? (
                      <div className="px-3 py-2 text-sm text-slate-400">Caut…</div>
                    ) : addrError ? (
                      <div className="px-3 py-2 text-sm text-rose-300">{addrError}</div>
                    ) : addrPredictions.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-slate-400">Nicio sugestie</div>
                    ) : (
                      <div className="max-h-64 overflow-auto">
                        {addrPredictions.slice(0, 8).map((p) => (
                          <button
                            key={p.placeId}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => void selectPrediction(p.placeId, p.description)}
                            className="block w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-900"
                          >
                            {p.description}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">Lat/Lng</div>
                  <div className="mt-1 font-mono text-slate-200">
                    {lat != null && lng != null ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : '—'}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">Județ (detectat)</div>
                  <div className="mt-1 text-slate-200">{county ?? '—'}</div>
                  {errors['location.county'] ? <div className="mt-1 text-rose-300">{errors['location.county']}</div> : null}
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">Place ID</div>
                  <div className="mt-1 font-mono text-slate-200">{placeId ? placeId : '—'}</div>
                </div>
              </div>

              {errors['location.placeId'] ? <p className="text-xs text-rose-300">{errors['location.placeId']}</p> : null}
              {errors['location.lat'] || errors['location.lng'] ? (
                <p className="text-xs text-rose-300">Selectează o sugestie Google Places ca să avem coordonate.</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-slate-200">Website, servicii & specialități</h3>
              <p className="mt-1 text-sm text-slate-500">Definim oferta și opțiunile de limbă / domeniu.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-200">Limbă UI</label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  value={languageMode}
                  onChange={(e) => setLanguageMode(parseLanguageMode(e.target.value))}
                >
                  <option value="ro">Română</option>
                  <option value="ro_en">Română + Engleză</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-200">Alte limbi (manual, cost extra)</label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  value={otherLanguagesNotes}
                  onChange={(e) => setOtherLanguagesNotes(e.target.value)}
                  placeholder="ex: Franceză — de discutat separat"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-200">Site vechi (pentru inspirație)?</p>
                  <p className="mt-1 text-xs text-slate-500">Dacă există, îl folosim ca referință pentru structură/ton.</p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={hasOldWebsite}
                    onChange={(e) => setHasOldWebsite(e.target.checked)}
                  />
                  Da
                </label>
              </div>
              {hasOldWebsite ? (
                <div className="mt-3 space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">URL site vechi</label>
                  <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                    value={oldWebsiteUrl}
                    onChange={(e) => setOldWebsiteUrl(e.target.value)}
                    placeholder="https://…"
                  />
                  {errors['website.oldWebsiteUrl'] ? (
                    <p className="text-xs text-rose-300">{errors['website.oldWebsiteUrl']}</p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-200">Domeniu</p>
                  <p className="mt-1 text-xs text-slate-500">Dacă se dorește migrare, o tratăm ca task separat (manual).</p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={wantsDomainMigration}
                    onChange={(e) => setWantsDomainMigration(e.target.checked)}
                  />
                  Vreau migrare pe domeniul acesta
                </label>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Domeniu (fără https)
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="ex: cabinet-psihologie.ro"
                  />
                  {errors['website.domain'] ? <p className="text-xs text-rose-300">{errors['website.domain']}</p> : null}
                </div>
                {wantsDomainMigration ? (
                  <label className="inline-flex items-center gap-2 text-sm text-slate-300 mt-6 md:mt-0">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={dnsAccessAvailable}
                      onChange={(e) => setDnsAccessAvailable(e.target.checked)}
                    />
                    Avem acces la DNS / modificări domeniu
                  </label>
                ) : (
                  <div className="text-xs text-slate-500 mt-6 md:mt-0">
                    Dacă domeniul nu este stabilit acum, putem decide ulterior.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">Servicii (cu prețuri)</p>
                  <p className="mt-1 text-xs text-slate-500">Prețul e manual (diferă per client). RON / ședință.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_SERVICES.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => addPresetService(s)}
                    className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-200 hover:bg-slate-900"
                  >
                    + {s.name}
                  </button>
                ))}
              </div>

              {services.length > 0 ? (
                <div className="space-y-2">
                  {services.map((s) => (
                    <div
                      key={s.name}
                      className="rounded-xl border border-slate-800 bg-slate-950/30 p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-200">{s.name}</div>
                        <div className="text-xs text-slate-500">
                          Durată: {s.durationMinutes ?? '—'} min
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          className="w-28 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                          value={s.priceRon == null ? '' : String(s.priceRon)}
                          onChange={(e) => setServicePrice(s.name, e.target.value)}
                          inputMode="numeric"
                          placeholder="Preț"
                        />
                        <span className="text-xs text-slate-500">RON</span>
                        <button
                          type="button"
                          onClick={() => removeService(s.name)}
                          className="rounded-lg border border-slate-700 px-2 py-2 text-xs text-slate-300 hover:bg-slate-900"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Nu ai adăugat servicii încă.</p>
              )}

              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <input
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  placeholder="Serviciu custom (nume)"
                />
                <input
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  value={customServiceDuration}
                  onChange={(e) => setCustomServiceDuration(e.target.value)}
                  inputMode="numeric"
                  placeholder="Durată (min)"
                />
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                    value={customServicePrice}
                    onChange={(e) => setCustomServicePrice(e.target.value)}
                    inputMode="numeric"
                    placeholder="Preț (RON)"
                  />
                  <button
                    type="button"
                    onClick={addCustomService}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                  >
                    Add
                  </button>
                </div>
              </div>

              {errors['services'] ? <p className="text-xs text-rose-300">{errors['services']}</p> : null}
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-200">Specialități</p>
                <p className="mt-1 text-xs text-slate-500">Poți selecta mai multe + adăuga custom.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_SPECIALTIES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecialty(s)}
                    className={clsx(
                      'rounded-full border px-3 py-1 text-xs',
                      specialties.includes(s)
                        ? 'border-emerald-700 bg-emerald-950/40 text-emerald-200'
                        : 'border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-900',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  value={customSpecialty}
                  onChange={(e) => setCustomSpecialty(e.target.value)}
                  placeholder="Specialitate custom"
                />
                <button
                  type="button"
                  onClick={addCustomSpecialty}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900"
                >
                  Add
                </button>
              </div>
              {specialties.length > 0 ? (
                <p className="text-xs text-slate-500">
                  Selectate: <span className="text-slate-200">{specialties.join(', ')}</span>
                </p>
              ) : null}
              {errors['specialties'] ? <p className="text-xs text-rose-300">{errors['specialties']}</p> : null}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-slate-200">Automatizare, GBP, Keywords</h3>
              <p className="mt-1 text-sm text-slate-500">Setări operaționale (nu client-facing). Debug-only.</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
              <p className="text-sm font-medium text-slate-200">Automatizare</p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {(
                  [
                    { id: 'passive', label: 'Pasiv' },
                    { id: 'whatsapp', label: 'WhatsApp' },
                    { id: 'calcom', label: 'Cal.com' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setAutomationMode(m.id)}
                    className={clsx(
                      'rounded-lg border px-3 py-2 text-sm text-left',
                      automationMode === m.id
                        ? 'border-emerald-700 bg-emerald-950/40 text-emerald-200'
                        : 'border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-900',
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {automationMode === 'whatsapp' ? (
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Număr WhatsApp (cu prefix)
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="ex: 40722…"
                  />
                  {errors['automation.whatsappNumber'] ? (
                    <p className="text-xs text-rose-300">{errors['automation.whatsappNumber']}</p>
                  ) : null}
                </div>
              ) : null}

              {automationMode === 'calcom' ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Cal.com username</label>
                    <input
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                      value={calUsername}
                      onChange={(e) => setCalUsername(e.target.value)}
                      placeholder="ex: dr-maria-ionescu"
                    />
                    {errors['automation.calUsername'] ? (
                      <p className="text-xs text-rose-300">{errors['automation.calUsername']}</p>
                    ) : null}
                    <p className="text-xs text-slate-500">
                      Format: <span className="font-mono text-slate-300">cal.com/{calUsername || 'username'}</span> ·
                      timezone: <span className="font-mono text-slate-300">Europe/Bucharest</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Cal.com API key (debug)
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                        value={calApiKey}
                        onChange={(e) => setCalApiKey(e.target.value)}
                        placeholder="Paste aici doar pentru test (nu se salvează)"
                        type={revealCalKey ? 'text' : 'password'}
                      />
                      <button
                        type="button"
                        onClick={() => setRevealCalKey((v) => !v)}
                        className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900"
                      >
                        {revealCalKey ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      În debug preview, cheia este mascată implicit (se vede doar finalul).
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
              <p className="text-sm font-medium text-slate-200">Google Business Profile (GBP)</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Email Google client</label>
                  <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                    value={clientGoogleAccountEmail}
                    onChange={(e) => setClientGoogleAccountEmail(e.target.value)}
                    placeholder="email@gmail.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Email operator (acces)</label>
                  <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                    value={gbpOperatorEmail}
                    onChange={(e) => setGbpOperatorEmail(e.target.value)}
                    placeholder="operator@…"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={profileExists}
                    onChange={(e) => setProfileExists(e.target.checked)}
                  />
                  Profil existent
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={profileClaimed}
                    disabled={!profileExists}
                    onChange={(e) => setProfileClaimed(e.target.checked)}
                  />
                  Claimed
                </label>
                <select
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  value={gbpVerificationExpected}
                  onChange={(e) => setGbpVerificationExpected(parseVerificationExpected(e.target.value))}
                >
                  <option value="unknown">Verificare: necunoscut</option>
                  <option value="postcard">Postcard</option>
                  <option value="phone">Telefon</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Link Maps (opțional)</label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  value={gbpMapsUrl}
                  onChange={(e) => setGbpMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/…"
                />
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-400">
                <div className="font-medium text-slate-200">Note (flow)</div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Clientul trebuie să aibă cont Google + acces de owner/manager.</li>
                  <li>Verificarea (postcard/telefon/video) poate dura zile; nu e bypass.</li>
                  <li>După ce avem manager access, unele acțiuni sunt blocate ~7 zile (Day 9+ gate).</li>
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
              <p className="text-sm font-medium text-slate-200">Seed keywords (operator)</p>
              <p className="text-xs text-slate-500">
                Nu afișăm keywords generate. Aici doar seed (~10) pentru DataForSEO + review ulterior.
              </p>
              <textarea
                className="min-h-28 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={seedKeywordsRaw}
                onChange={(e) => setSeedKeywordsRaw(e.target.value)}
                placeholder="1 per linie sau separate prin virgulă…"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Count: <span className="text-slate-200">{parseSeedKeywords(seedKeywordsRaw).length}</span>
                </p>
                <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={keywordsApproved}
                    onChange={(e) => setKeywordsApproved(e.target.checked)}
                  />
                  Aprobat de operator
                </label>
              </div>
              {errors['keywords.seedKeywords'] ? (
                <p className="text-xs text-rose-300">{errors['keywords.seedKeywords']}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-200">Review payload (debug)</h3>
              <p className="mt-1 text-sm text-slate-500">
                Acesta este payload-ul final pe care îl vom conecta ulterior la Supabase + `scripting/`.
              </p>
            </div>

            {!validation.success ? (
              <div className="rounded-xl border border-rose-800/40 bg-rose-950/20 p-4 text-sm text-rose-200">
                Payload invalid. Întoarce-te și corectează câmpurile.
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4 text-sm text-emerald-200">
                Payload valid (Zod).
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => void copyJson()}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
              >
                Copy JSON
              </button>
              <div className="text-xs text-slate-500">
                Cal key masked: <span className="font-mono text-slate-200">{maskSecret(calApiKey)}</span>
              </div>
            </div>

            <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4">
              <pre className="text-xs text-emerald-200/90">
                {JSON.stringify(intakeMasked, null, 2)}
              </pre>
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-6">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 disabled:opacity-40"
          >
            ← Înapoi
          </button>

          <div className="flex items-center gap-3">
            {status ? <span className="text-xs text-slate-400">{status}</span> : null}
            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (!validateCurrentStep()) return
                  setStep((s) => Math.min(4, s + 1))
                }}
                className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200"
              >
                Continuă →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-lg border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-900"
              >
                Restart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

