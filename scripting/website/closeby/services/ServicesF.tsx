import { formatPrice, formatDuration } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { ClientConfig } from '@/types/client-config'

/** Services F — dark pricing-style panel. */
export function ServicesF({ config }: { config: ClientConfig }) {
  return (
    <section id="cb-section-servicii" data-cb-variant="f" className="services-f py-24 px-6 lg:px-10 bg-ink text-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-14">
          <span className="text-xs font-medium tracking-[0.1em] uppercase text-sage-l">Servicii</span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-white mt-3">{config.content.servicesTitle}</h2>
          <p className="text-white/55 mt-3 max-w-xl text-sm">{config.content.servicesSubtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {config.services.map((service) => (
            <div
              key={service.id}
              className={cn(
                'rounded-2xl p-8 border flex flex-col',
                service.featured ? 'bg-sage-d border-sage-l/40' : 'bg-white/5 border-white/10'
              )}
            >
              <div className="text-2xl mb-4">{service.icon}</div>
              <h3 className="font-serif text-xl font-medium mb-2">{service.title}</h3>
              <p className="text-sm text-white/65 leading-relaxed flex-1 mb-6">{service.description}</p>
              <div className="pt-4 border-t border-white/10 flex items-end justify-between">
                <div>
                  <div className="font-serif text-2xl font-semibold text-sage-l">{formatPrice(service.price, service.currency)}</div>
                  <div className="text-xs text-white/45 mt-0.5">{formatDuration(service.duration)}</div>
                </div>
                <a href="#programare" className="text-sm font-medium text-white/80 hover:text-white">
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
