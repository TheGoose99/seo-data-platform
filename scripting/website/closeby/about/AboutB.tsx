import type { ClientConfig } from '@/types/client-config'

/** About B — horizontal card with prominent quote (about-b). */
export function AboutB({ config }: { config: ClientConfig }) {
  return (
    <section id="cb-section-despre" data-cb-variant="b" className="about-b py-24 px-6 lg:px-10 bg-cream">
      <div className="max-w-[1120px] mx-auto">
        <span className="text-xs font-medium tracking-[0.1em] uppercase text-sage-d block mb-8">
          {config.content.aboutEyebrow}
        </span>
        <div className="bg-white rounded-3xl p-10 md:p-14 border border-ink/5 grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-40 h-48 rounded-[50%_50%_40%_40%] bg-sage-xl flex items-center justify-center text-sm text-sage-d/70">
              {config.shortName.split(' ').map((p) => p[0]).join('.')}
            </div>
            <div className="font-serif text-xl font-medium text-ink">{config.name}</div>
            <div className="text-xs text-ink-l">{config.credentials}</div>
            <div className="w-full space-y-2 text-left mt-2">
              {config.credentialsBullets.slice(0, 3).map((c) => (
                <div key={c} className="flex items-center gap-2 text-xs text-ink-m">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage-d" />
                  {c}
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <span className="font-serif text-7xl text-sage-xl leading-none block mb-2">{'"'}</span>
            <p className="font-serif text-2xl md:text-[1.65rem] italic text-ink-m leading-snug mb-6">
              {config.content.aboutPullQuote.replace(/^[„"]|[„"]$/g, '').trim()}
            </p>
            <p className="text-ink-l leading-relaxed mb-6 text-[0.9875rem]">{config.bio}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {config.approaches.map((a) => (
                <div
                  key={a}
                  className="flex items-center gap-2 bg-sage-xl border border-sage-l rounded-lg px-3 py-2 text-xs text-sage-d font-medium"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sage-d flex-shrink-0" />
                  {a}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
