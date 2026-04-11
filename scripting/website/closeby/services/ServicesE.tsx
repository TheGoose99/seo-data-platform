import { formatPrice, formatDuration } from '@/lib/utils'
import type { ClientConfig } from '@/types/client-config'

/** Services E — compact 2-column cards. */
export function ServicesE({ config }: { config: ClientConfig }) {
  return (
    <section id="cb-section-servicii" data-cb-variant="e" className="services-e py-24 px-6 lg:px-10 bg-sage-xl/30">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <span className="text-xs font-medium tracking-[0.1em] uppercase text-sage-d">Servicii</span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-ink mt-3">{config.content.servicesTitle}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {config.services.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl p-8 border border-sage-l/30 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-sage-xl flex items-center justify-center text-xl mb-4">{service.icon}</div>
              <h3 className="font-serif text-xl font-medium text-ink mb-2">{service.title}</h3>
              <p className="text-sm text-ink-l leading-relaxed mb-6">{service.description}</p>
              <div className="flex items-end justify-between pt-4 border-t border-sage-l/20">
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
