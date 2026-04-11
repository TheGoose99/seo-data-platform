import Image from 'next/image'
import type { ClientConfig } from '@/types/client-config'

/** About E — centered narrow column. */
export function AboutE({ config }: { config: ClientConfig }) {
  return (
    <section id="cb-section-despre" data-cb-variant="e" className="about-e py-24 px-6 lg:px-10 bg-white">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-44 h-44 rounded-full mx-auto mb-8 overflow-hidden border-4 border-sage-l/40 bg-sage-xl">
          {config.images.therapist ? (
            <Image
              src={config.images.therapist}
              alt={config.shortName}
              width={176}
              height={176}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sage-d/50 text-sm">Portrait</div>
          )}
        </div>
        <span className="text-xs font-medium tracking-[0.1em] uppercase text-sage-d block mb-3">{config.content.aboutEyebrow}</span>
        <h2 className="font-serif text-3xl md:text-4xl font-medium text-ink mb-4">
          {config.content.aboutTitleLead}{' '}
          <em className="text-sage-d not-italic">{config.yearsExperience} ani</em>
        </h2>
        <p className="text-ink-l leading-relaxed text-[0.9875rem] mb-8">{config.bio}</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {config.credentialsBullets.map((c) => (
            <span key={c} className="text-xs bg-sage-xl text-sage-d px-3 py-1 rounded-full">
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
