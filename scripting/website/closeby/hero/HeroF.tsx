import Image from 'next/image'
import type { ClientConfig } from '@/types/client-config'

const FALLBACK_BLUR_DATA_URL =
  'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA='

/** Hero F — narrow centered column, minimal chrome. */
export function HeroF({ config }: { config: ClientConfig }) {
  const chips = config.content.heroChips ?? config.approaches.slice(0, 5)

  return (
    <section
      id="cb-section-hero"
      data-cb-variant="f"
      className="hero-f min-h-[85vh] pt-20 pb-16 px-6 text-center bg-cream"
    >
      <div className="max-w-xl mx-auto">
        <div className="w-24 h-24 rounded-full mx-auto mb-6 bg-sage-xl ring-2 ring-sage-l overflow-hidden">
          {config.images.therapist ? (
            <Image
              src={config.images.therapist}
              alt={config.shortName}
              width={96}
              height={96}
              className="object-cover w-full h-full"
              placeholder="blur"
              blurDataURL={FALLBACK_BLUR_DATA_URL}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-sage-d">AI</div>
          )}
        </div>
        <p className="text-xs uppercase tracking-widest text-sage-d mb-4">{config.content.heroAvailability}</p>
        <h1 className="font-serif text-4xl md:text-5xl font-medium text-ink mb-4 leading-tight">
          {config.content.heroTitle} <em className="text-sage-d not-italic">{config.content.heroTitleAccent}</em>
        </h1>
        <p className="text-ink-l text-sm md:text-base leading-relaxed mb-6">{config.content.heroSubtitle}</p>
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {chips.slice(0, 4).map((c) => (
            <span key={c} className="text-xs bg-white border border-sage-l/40 rounded-full px-3 py-1 text-ink-m">
              {c}
            </span>
          ))}
        </div>
        <a
          href="#programare"
          className="inline-flex items-center gap-2 bg-sage-d text-white px-6 py-3 rounded-full text-sm font-medium shadow-md hover:bg-ink transition-colors"
        >
          {config.content.heroCta} →
        </a>
      </div>
    </section>
  )
}
