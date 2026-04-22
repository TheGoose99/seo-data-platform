import { z } from 'zod'
import { ROMANIAN_COUNTIES } from '@/lib/romania/counties'

const phoneRaw = z
  .string()
  .trim()
  .min(1, 'Telefonul este obligatoriu')
  .max(50)
  .refine((v) => /[0-9]/.test(v), 'Telefon invalid')

const domain = z
  .string()
  .trim()
  .min(1, 'Domeniul este obligatoriu')
  .max(255)
  .refine((v) => !/^https?:\/\//i.test(v), 'Introdu doar domeniul (fără http/https)')
  .refine((v) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(v), 'Domeniu invalid')

const urlOptional = z
  .string()
  .trim()
  .max(1000)
  .optional()
  .transform((v) => (v && v.trim() ? v.trim() : undefined))
  .refine((v) => {
    if (!v) return true
    try {
      const u = new URL(v)
      return u.protocol === 'https:' || u.protocol === 'http:'
    } catch {
      return false
    }
  }, 'URL invalid')

const priceRon = z
  .number({ message: 'Preț invalid' })
  .int('Preț invalid')
  .min(0, 'Preț invalid')
  .max(50_000, 'Preț prea mare')

export const onboardingIntakeSchema = z
  .object({
    orgId: z.string().uuid(),
    debugOnly: z.literal(true),

    client: z.object({
      displayName: z.string().trim().min(2, 'Numele este obligatoriu').max(500),
      legalType: z.enum(['CIP', 'SRL', 'CLINICA']).optional(),
      email: z.string().trim().email('Email invalid').max(500),
      phone: phoneRaw,
    }),

    location: z.object({
      addressText: z.string().trim().min(5, 'Adresa este obligatorie').max(2000),
      placeId: z.string().trim().min(1, 'Selectează o sugestie Google Places').max(300),
      lat: z.number().finite(),
      lng: z.number().finite(),
      county: z.enum(ROMANIAN_COUNTIES as unknown as [string, ...string[]], {
        message: 'Județ invalid (selectează o adresă din Google Places)',
      }),
      countyRaw: z.string().trim().max(200).optional(),
      locality: z.string().trim().max(200).optional(),
    }),

    website: z.object({
      languageMode: z.enum(['ro', 'ro_en']),
      otherLanguagesNotes: z.string().trim().max(500).optional(),
      hasOldWebsite: z.boolean(),
      oldWebsiteUrl: urlOptional,
      domain: domain.optional(),
      wantsDomainMigration: z.boolean(),
      dnsAccessAvailable: z.boolean().optional(),
    }),

    services: z
      .array(
        z.object({
          name: z.string().trim().min(2).max(200),
          durationMinutes: z.number().int().min(10).max(240).optional(),
          priceRon,
        }),
      )
      .min(1, 'Selectează cel puțin un serviciu'),

    specialties: z.array(z.string().trim().min(2).max(120)).min(1, 'Selectează cel puțin o specialitate'),

    automation: z.object({
      mode: z.enum(['passive', 'whatsapp', 'calcom']),
      whatsappNumber: z.string().trim().max(50).optional(),
      calUsername: z.string().trim().max(200).optional(),
      calApiKey: z.string().trim().max(500).optional(),
      timezone: z.literal('Europe/Bucharest'),
    }),

    gbp: z.object({
      clientGoogleAccountEmail: z.string().trim().email('Email Google invalid').max(500).optional(),
      profileExists: z.boolean(),
      profileClaimed: z.boolean().optional(),
      mapsUrl: urlOptional,
      placeId: z.string().trim().max(300).optional(),
      operatorAccessEmail: z.string().trim().email('Email operator invalid').max(500).optional(),
      verificationExpected: z.enum(['unknown', 'postcard', 'phone', 'video']).default('unknown'),
    }),

    keywords: z.object({
      seedKeywords: z
        .array(z.string().trim().min(2).max(200))
        .min(5, 'Adaugă cel puțin 5 seed keywords')
        .max(30, 'Prea multe seed keywords'),
      approvedByOperator: z.boolean(),
    }),
  })
  .superRefine((val, ctx) => {
    if (val.website.hasOldWebsite && !val.website.oldWebsiteUrl) {
      ctx.addIssue({
        code: 'custom',
        path: ['website', 'oldWebsiteUrl'],
        message: 'Completează URL-ul site-ului vechi',
      })
    }
    if (val.website.wantsDomainMigration && !val.website.domain) {
      ctx.addIssue({
        code: 'custom',
        path: ['website', 'domain'],
        message: 'Completează domeniul pentru migrare',
      })
    }
    if (val.automation.mode === 'whatsapp' && !(val.automation.whatsappNumber ?? '').trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['automation', 'whatsappNumber'],
        message: 'Completează numărul WhatsApp',
      })
    }
    if (val.automation.mode === 'calcom' && !(val.automation.calUsername ?? '').trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['automation', 'calUsername'],
        message: 'Completează username-ul Cal.com',
      })
    }
  })

export type OnboardingIntake = z.infer<typeof onboardingIntakeSchema>

