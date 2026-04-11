import { formatPrice, formatDuration } from '@/lib/utils'
import type { ClientConfig } from '@/types/client-config'

/** Services D — zebra rows. */
export function ServicesD({ config }: { config: ClientConfig }) {
  return (
    <section id="cb-section-servicii" data-cb-variant="d" className="services-d py-24 px-6 lg:px-10 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-14">
          <span className="text-xs font-medium tracking-[0.1em] uppercase text-sage-d">Servicii</span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-ink mt-3">{config.content.servicesTitle}</h2>
          <p className="text-ink-l mt-3 max-w-xl">{config.content.servicesSubtitle}</p>
        </div>
        <div className="rounded-3xl border border-sage-l/25 overflow-hidden divide-y divide-sage-l/20">
          {config.services.map((service, idx) => (
            <div
              key={service.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-4 p-6 md:p-8 ${
                idx % 2 === 0 ? 'bg-cream/80' : 'bg-white'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-sage-xl flex items-center justify-center text-xl flex-shrink-0">{service.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg font-medium text-ink">{service.title}</h3>
                <p className="text-sm text-ink-l mt-1 leading-relaxed">{service.description}</p>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <div className="font-serif text-2xl font-semibold text-sage-d">{formatPrice(service.price, service.currency)}</div>
                <div className="text-xs text-ink-xl">{formatDuration(service.duration)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
