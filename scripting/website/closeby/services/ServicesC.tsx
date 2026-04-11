import { formatPrice, formatDuration } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { ClientConfig } from '@/types/client-config'

/** Services C — large featured + two stacked cards (services-c). */
export function ServicesC({ config }: { config: ClientConfig }) {
  const featured = config.services.find((s) => s.featured) ?? config.services[0]
  const rest = config.services.filter((s) => s.id !== featured?.id).slice(0, 2)

  if (!featured) return null

  return (
    <section id="cb-section-servicii" data-cb-variant="c" className="services-c py-24 px-6 lg:px-10 bg-cream">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-14">
          <span className="text-xs font-medium tracking-[0.1em] uppercase text-sage-d">Servicii</span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-ink mt-3">{config.content.servicesTitle}</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:grid-rows-2 gap-4">
          <div className="lg:row-span-2 bg-sage-d rounded-3xl p-10 flex flex-col text-white min-h-[360px]">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-2xl mb-6">{featured.icon}</div>
            <h3 className="font-serif text-2xl md:text-3xl font-medium mb-3">{featured.title}</h3>
            <p className="text-sm leading-relaxed text-white/70 flex-1 mb-8">{featured.description}</p>
            <div className="border-t border-white/15 pt-6 flex items-end justify-between">
              <div>
                <div className="font-serif text-3xl font-semibold">{formatPrice(featured.price, featured.currency)}</div>
                <div className="text-xs text-white/50 mt-1">{formatDuration(featured.duration)}</div>
              </div>
              <a href="#programare" className="text-sm font-medium text-white/80 hover:text-white">
                Rezervă →
              </a>
            </div>
          </div>
          {rest.map((service) => (
            <div key={service.id} className="bg-white rounded-3xl p-8 border border-ink/5 flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-sage-xl flex items-center justify-center text-xl mb-4">{service.icon}</div>
              <h3 className="font-serif text-xl font-medium text-ink mb-2">{service.title}</h3>
              <p className="text-sm text-ink-l flex-1 mb-6">{service.description}</p>
              <div className={cn('flex items-end justify-between pt-5 border-t border-sage-l/20')}>
                <div>
                  <div className="font-serif text-2xl font-semibold text-sage-d">{formatPrice(service.price, service.currency)}</div>
                  <div className="text-xs text-ink-xl mt-0.5">{formatDuration(service.duration)}</div>
                </div>
                <a href="#programare" className="text-sm font-medium text-sage-d">
                  Rezervă →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
