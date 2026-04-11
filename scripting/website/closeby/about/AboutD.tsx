import Image from 'next/image'
import type { ClientConfig } from '@/types/client-config'

/** About D — text first, portrait second (reversed vs A). */
export function AboutD({ config }: { config: ClientConfig }) {
  return (
    <section id="cb-section-despre" data-cb-variant="d" className="about-d py-24 px-6 lg:px-10 bg-cream">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="lg:order-1 order-2">
            <span className="text-xs font-medium tracking-[0.1em] uppercase text-sage-d block mb-4">{config.content.aboutEyebrow}</span>
            <h2 className="font-serif text-4xl md:text-5xl font-medium text-ink mb-6 leading-tight">
              {config.content.aboutTitleLead}{' '}
              <span className="text-sage-d italic">{config.yearsExperience} ani</span>
              <br />
              {config.content.aboutTitleLine2}
            </h2>
            <div className="border-l-[3px] border-sage-d pl-5 mb-6">
              <p className="font-serif text-xl italic text-sage-d leading-relaxed">{config.content.aboutPullQuote}</p>
            </div>
            <p className="text-ink-l leading-relaxed mb-4 text-[0.9875rem]">{config.bio}</p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {config.approaches.map((a) => (
                <div
                  key={a}
                  className="flex items-center gap-2 bg-white border border-sage-l/40 rounded-lg px-4 py-2.5 text-sm text-sage-d font-medium"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sage-d flex-shrink-0" />
                  {a}
                </div>
              ))}
            </div>
          </div>
          <div className="lg:order-2 order-1 lg:sticky lg:top-24">
            <div className="rounded-2xl overflow-hidden aspect-[4/5] bg-gradient-to-br from-sage-xl to-sage-l flex items-center justify-center">
              {config.images.therapist ? (
                <Image
                  src={config.images.therapist}
                  alt={`${config.shortName} — ${config.credentials}`}
                  width={600}
                  height={750}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-sage-d opacity-40">
                  <span className="font-serif italic">Fotografie cabinet</span>
                </div>
              )}
            </div>
            <div className="mt-6 space-y-3">
              {config.credentialsBullets.map((cred) => (
                <div key={cred} className="flex items-center gap-3 text-sm text-ink-m">
                  <span className="w-2 h-2 rounded-full bg-sage-d flex-shrink-0" />
                  {cred}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
