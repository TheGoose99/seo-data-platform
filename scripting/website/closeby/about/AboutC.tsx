import type { ClientConfig } from '@/types/client-config'

/** About C — dark panel (about-c). */
export function AboutC({ config }: { config: ClientConfig }) {
  return (
    <section id="cb-section-despre" data-cb-variant="c" className="about-c py-24 px-6 lg:px-10 bg-ink text-white">
      <div className="max-w-[1120px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="inline-flex items-center gap-2 bg-sage-d/20 text-sage-l px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-d" />
            {config.content.aboutEyebrow}
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-white mb-5 leading-tight">
            {config.content.aboutTitleLead}{' '}
            <em className="text-sage-l not-italic">{config.yearsExperience} ani</em> {config.content.aboutTitleLine2}
          </h2>
          <p className="text-white/60 leading-relaxed mb-8 text-[0.9875rem]">{config.bio}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-10">
            {config.approaches.map((a) => (
              <div
                key={a}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sage-d flex-shrink-0" />
                {a}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
            {[
              { value: `${config.yearsExperience}+`, label: 'ani exp.' },
              { value: `${config.patientsHelped}+`, label: 'pacienți' },
              { value: `${config.aggregateRating.ratingValue}★`, label: 'Google' },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-serif text-2xl font-semibold text-sage-l">{s.value}</div>
                <div className="text-xs text-white/40 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="aspect-square rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 font-serif text-lg">
          {config.shortName}
        </div>
      </div>
    </section>
  )
}
