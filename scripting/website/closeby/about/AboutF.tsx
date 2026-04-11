import type { ClientConfig } from '@/types/client-config'

/** About F — split stats + narrative on sage wash. */
export function AboutF({ config }: { config: ClientConfig }) {
  return (
    <section id="cb-section-despre" data-cb-variant="f" className="about-f py-24 px-6 lg:px-10 bg-gradient-to-br from-sage-xl/50 to-cream">
      <div className="max-w-[1120px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-6">
          <span className="text-xs font-medium tracking-[0.1em] uppercase text-sage-d">{config.content.aboutEyebrow}</span>
          <div className="space-y-4">
            {[
              { value: `${config.yearsExperience}+`, label: 'ani experiență' },
              { value: `${config.patientsHelped}+`, label: 'pacienți' },
              { value: `${config.aggregateRating.ratingValue}★`, label: 'Google' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-6 border border-sage-l/25 shadow-sm">
                <div className="font-serif text-3xl font-semibold text-sage-d">{s.value}</div>
                <div className="text-xs text-ink-l mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-8">
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-ink mb-6 leading-tight">
            {config.content.aboutTitleLead} <span className="text-sage-d italic">{config.yearsExperience} ani</span>
            <br />
            {config.content.aboutTitleLine2}
          </h2>
          <p className="font-serif text-xl italic text-sage-d mb-6">{config.content.aboutPullQuote}</p>
          <p className="text-ink-l leading-relaxed text-[0.9875rem] mb-8">{config.bio}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {config.approaches.map((a) => (
              <div key={a} className="flex items-center gap-2 text-sm text-ink-m">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-d" />
                {a}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
