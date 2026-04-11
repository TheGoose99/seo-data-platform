import Image from 'next/image'
import type { ClientConfig } from '@/types/client-config'

const FALLBACK_BLUR_DATA_URL =
  'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA='

/** Hero E — split layout inside a soft framed panel. */
export function HeroE({ config }: { config: ClientConfig }) {
  return (
    <section id="cb-section-hero" data-cb-variant="e" className="hero-e min-h-svh pt-16 pb-12 px-4 lg:px-10 bg-gradient-to-b from-sage-xl/40 to-cream">
      <div className="max-w-[1160px] mx-auto rounded-3xl border border-sage-l/40 bg-white/80 backdrop-blur-sm shadow-sm p-6 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-sage-xl text-sage-d px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-d" />
              {config.content.heroAvailability}
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-medium leading-[1.1] text-ink mb-5">
              {config.content.heroTitle}{' '}
              <em className="text-sage-d not-italic">{config.content.heroTitleAccent}</em>
            </h1>
            <p className="text-base lg:text-lg text-ink-l leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              {config.content.heroSubtitle}
            </p>
            <div className="flex items-center gap-4 flex-wrap justify-center lg:justify-start">
              <a
                href="#programare"
                className="inline-flex items-center gap-2 bg-sage-d text-white px-7 py-4 rounded-full text-[0.9375rem] font-medium shadow-lg hover:bg-ink transition-all"
              >
                {config.content.heroCta} →
              </a>
              <a href="#despre" className="text-ink-m border-b border-ink-xl pb-0.5 hover:text-sage-d">
                {config.content.heroCtaSecondary}
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden bg-sage-xl">
              {config.images.therapist ? (
                <Image
                  src={config.images.therapist}
                  alt={config.shortName}
                  fill
                  className="object-cover"
                  sizes="400px"
                  placeholder="blur"
                  blurDataURL={FALLBACK_BLUR_DATA_URL}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sage-d/50 font-serif">Dr. {config.shortName}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
