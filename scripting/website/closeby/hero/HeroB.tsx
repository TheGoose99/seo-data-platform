import Image from 'next/image'
import type { ClientConfig } from '@/types/client-config'

const FALLBACK_BLUR_DATA_URL =
  'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA='

/** CloseBy Hero B — centered, tinted backdrop (hero-b). */
export function HeroB({ config }: { config: ClientConfig }) {
  const chips = config.content.heroChips ?? config.approaches.slice(0, 5)

  return (
    <section
      id="cb-section-hero"
      data-cb-variant="b"
      className="hero-b relative min-h-svh pt-16 pb-16 text-center overflow-hidden bg-white"
    >
      <div className="absolute top-0 left-0 right-0 h-[60%] bg-sage-l z-0" aria-hidden />
      <div className="relative z-10 max-w-[760px] mx-auto px-6">
        <div className="w-[140px] h-[140px] rounded-full mx-auto mb-8 bg-sage-xl border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
          {config.images.therapist ? (
            <Image
              src={config.images.therapist}
              alt={config.shortName}
              width={140}
              height={140}
              className="object-cover w-full h-full"
              placeholder="blur"
              blurDataURL={FALLBACK_BLUR_DATA_URL}
            />
          ) : (
            <span className="text-sm text-sage-d opacity-70">Dr. {config.shortName}</span>
          )}
        </div>

        <div className="inline-flex items-center gap-2 bg-white/80 text-sage-d px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-sage-d" />
          {config.content.heroAvailability}
        </div>

        <h1 className="font-serif text-5xl md:text-6xl font-medium leading-tight text-ink mb-5">
          {config.content.heroTitle}{' '}
          <em className="text-sage-d not-italic">{config.content.heroTitleAccent}</em>
        </h1>

        <p className="text-lg text-ink-l mb-8 max-w-[600px] mx-auto leading-relaxed">{config.content.heroSubtitle}</p>

        <div className="flex flex-wrap gap-2.5 justify-center mb-8">
          {chips.map((c) => (
            <span key={c} className="bg-white border border-ink/10 rounded-full px-3.5 py-1.5 text-xs text-ink-m">
              {c}
            </span>
          ))}
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          <a
            href="#programare"
            className="inline-flex items-center gap-2 bg-sage-d text-white px-7 py-4 rounded-full text-[0.9375rem] font-medium shadow-lg hover:bg-ink transition-all"
          >
            {config.content.heroCta} →
          </a>
          <a href="#servicii" className="inline-flex items-center gap-1.5 text-ink-m border-b border-ink-xl pb-0.5 hover:text-sage-d">
            Servicii →
          </a>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8 text-sm text-ink-l">
          <span className="text-clay">★★★★★</span>
          <span>
            {config.aggregateRating.ratingValue} · {config.aggregateRating.reviewCount} recenzii · {config.yearsExperience}+ ani exp.
          </span>
        </div>
      </div>
    </section>
  )
}
