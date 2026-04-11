import { formatPrice, formatDuration } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { ClientConfig } from '@/types/client-config'

export function ServicesA({ config }: { config: ClientConfig }) {
  return (
    <section id="cb-section-servicii" data-cb-variant="a" className="services-a py-24 px-6 lg:px-10 bg-cream">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-14">
          <span className="text-xs font-medium tracking-[0.1em] uppercase text-sage-d">Servicii</span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-ink mt-3 mb-3">{config.content.servicesTitle}</h2>
          <p className="text-ink-l text-lg max-w-xl">{config.content.servicesSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {config.services.map((service) => (
            <div
              key={service.id}
              className={cn(
                'flex flex-col rounded-2xl p-8 border transition-all duration-200',
                service.featured
                  ? 'bg-sage-d text-white border-transparent'
                  : 'bg-white border-sage-l/30 hover:border-sage-l hover:shadow-xl hover:-translate-y-1'
              )}
            >
              <div
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5',
                  service.featured ? 'bg-white/15' : 'bg-sage-xl'
                )}
              >
                {service.icon}
              </div>

              <h3 className={cn('font-serif text-xl font-medium mb-2', service.featured ? 'text-white' : 'text-ink')}>
                {service.title}
              </h3>
              <p className={cn('text-sm leading-relaxed flex-1 mb-5', service.featured ? 'text-white/70' : 'text-ink-l')}>
                {service.description}
              </p>

              <div
                className={cn(
                  'flex items-end justify-between pt-5 border-t',
                  service.featured ? 'border-white/15' : 'border-sage-l/20'
                )}
              >
                <div>
                  <div className={cn('font-serif text-2xl font-semibold', service.featured ? 'text-white' : 'text-sage-d')}>
                    {formatPrice(service.price, service.currency)}
                  </div>
                  <div className={cn('text-xs mt-0.5', service.featured ? 'text-white/50' : 'text-ink-xl')}>
                    {formatDuration(service.duration)}
                  </div>
                </div>
                <a
                  href="#programare"
                  className={cn(
                    'text-sm font-medium flex items-center gap-1 transition-colors',
                    service.featured ? 'text-white/80 hover:text-white' : 'text-sage-d hover:text-ink'
                  )}
                >
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
