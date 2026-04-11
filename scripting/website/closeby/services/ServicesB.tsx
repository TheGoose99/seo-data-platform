import { formatPrice, formatDuration } from '@/lib/utils'
import type { ClientConfig } from '@/types/client-config'

/** Services B — horizontal rows (services-b). */
export function ServicesB({ config }: { config: ClientConfig }) {
  return (
    <section id="cb-section-servicii" data-cb-variant="b" className="services-b py-24 px-6 lg:px-10 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-14">
          <span className="text-xs font-medium tracking-[0.1em] uppercase text-sage-d">Servicii</span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-ink mt-3">{config.content.servicesTitle}</h2>
        </div>
        <div className="flex flex-col gap-4">
          {config.services.map((service, idx) => (
            <div
              key={service.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-6 md:p-8 rounded-2xl border border-sage-l/20 bg-cream hover:border-sage-d hover:bg-sage-l/30 transition-all"
            >
              <div className="font-serif text-4xl font-semibold text-sage-xl w-12 flex-shrink-0 leading-none">
                {String(idx + 1).padStart(2, '0')}
              </div>
              <div className="w-11 h-11 rounded-xl bg-sage-xl flex items-center justify-center text-xl flex-shrink-0">
                {service.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg font-medium text-ink">{service.title}</h3>
                <p className="text-sm text-ink-l mt-1 leading-relaxed">{service.description}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-serif text-2xl font-semibold text-sage-d">{formatPrice(service.price, service.currency)}</div>
                <div className="text-xs text-ink-xl mt-0.5">{formatDuration(service.duration)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
