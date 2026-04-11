import Image from 'next/image'
import type { ClientConfig } from '@/types/client-config'

const FALLBACK_BLUR_DATA_URL =
  'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA='

/** CloseBy Hero C — editorial dark (hero-c). */
export function HeroC({ config }: { config: ClientConfig }) {
  return (
    <section id="cb-section-hero" data-cb-variant="c" className="hero-c bg-ink text-white overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[min(90vh,920px)]">
        <div className="lg:col-span-7 px-6 lg:px-12 py-16 lg:py-20 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 bg-sage-d/15 text-sage-l px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase mb-6 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-d" />
            {config.content.heroAvailability}
          </div>
          <h1 className="font-serif text-[clamp(2.25rem,5vw,4rem)] font-medium leading-tight text-white mb-2">
            {config.content.heroTitle}
            <br />
            <em className="text-sage-l not-italic">{config.content.heroTitleAccent}</em>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-[500px] my-6">{config.content.heroSubtitle}</p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#programare"
              className="inline-flex items-center gap-2 bg-sage-d text-white px-7 py-4 rounded-full text-[0.9375rem] font-medium hover:brightness-110 transition-all"
            >
              {config.content.heroCta} →
            </a>
            <a href="#servicii" className="inline-flex items-center gap-1.5 text-white/60 border-b border-white/20 pb-0.5 hover:text-white">
              Servicii →
            </a>
          </div>
          <div className="grid grid-cols-3 gap-6 mt-14 pt-10 border-t border-white/10 max-w-lg">
            <div>
              <div className="font-serif text-3xl font-semibold text-white">{config.yearsExperience}+</div>
              <div className="text-xs text-white/40 mt-1">ani experiență</div>
            </div>
            <div>
              <div className="font-serif text-3xl font-semibold text-white">{config.patientsHelped}+</div>
              <div className="text-xs text-white/40 mt-1">pacienți ajutați</div>
            </div>
            <div>
              <div className="font-serif text-3xl font-semibold text-white">{config.aggregateRating.ratingValue}★</div>
              <div className="text-xs text-white/40 mt-1">rating Google</div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-5 bg-sage-xl flex items-center justify-center min-h-[320px] lg:min-h-0 relative p-8">
          <div
            className="relative w-[min(280px,90vw)] aspect-[280/360] rounded-[50%_50%_40%_40%] overflow-hidden border-[3px] border-white/30 bg-gradient-to-br from-sage-l to-sage-xl flex items-center justify-center"
          >
            {config.images.therapist ? (
              <Image
                src={config.images.therapist}
                alt={config.shortName}
                fill
                className="object-cover"
                sizes="280px"
                placeholder="blur"
                blurDataURL={FALLBACK_BLUR_DATA_URL}
              />
            ) : (
              <span className="font-serif italic text-sage-d/50">Dr. {config.shortName}</span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
