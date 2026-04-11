import type { ClientConfig } from '@/types/client-config'
import type { HexVariant } from '@/types/client-config'

function LocationMap({ config }: { config: ClientConfig }) {
  const { address } = config
  return (
    <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-sage-l/30 shadow-sm">
      {address.mapsEmbedUrl ? (
        <iframe
          src={address.mapsEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Locație cabinet ${config.shortName} — ${address.street}, ${address.sector}`}
        />
      ) : (
        <div className="w-full h-full min-h-[280px] bg-sage-xl flex flex-col items-center justify-center gap-3 text-sage-d border-2 border-dashed border-sage-l rounded-2xl">
          <span className="text-4xl">🗺️</span>
          <div className="text-center">
            <p className="font-medium text-sm">Google Maps embed</p>
            <p className="text-xs opacity-60 mt-1">
              {address.street} · {address.sector}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function LocationInfo({ config }: { config: ClientConfig }) {
  const { address } = config
  return (
    <div className="space-y-6">
      {[
        {
          icon: '📍',
          title: 'Adresă cabinet',
          content: `${address.street}\n${address.sector}, ${address.city}, ${address.postalCode}`,
        },
        {
          icon: '🚇',
          title: 'Transport public',
          content: address.nearbyTransport.join('\n'),
        },
        {
          icon: '🕘',
          title: 'Program',
          content: `${config.openingHoursDisplay}\n${config.content.locationSaturdayNote}`,
        },
        {
          icon: '🚗',
          title: 'Parcare',
          content: address.parking,
        },
      ].map((item) => (
        <div key={item.title} className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-lg bg-sage-xl flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
            {item.icon}
          </div>
          <div>
            <div className="font-medium text-ink text-sm mb-1">{item.title}</div>
            {item.content.split('\n').map((line, i) => (
              <div key={i} className="text-sm text-ink-m leading-relaxed">
                {line}
              </div>
            ))}
          </div>
        </div>
      ))}

      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.street + ', ' + address.sector + ', ' + address.city)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-sage-xl text-sage-d px-5 py-3 rounded-full text-sm font-medium hover:bg-sage-l transition-colors mt-2"
      >
        Deschide în Google Maps →
      </a>
    </div>
  )
}

function LocationShell({
  config,
  variant,
  className,
  mapFirst,
}: {
  config: ClientConfig
  variant: HexVariant
  className: string
  mapFirst?: boolean
}) {
  const { address } = config
  const grid = 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-start'
  return (
    <section id="cb-section-contact" data-cb-variant={variant} className={className}>
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-14">
          <span className="text-xs font-medium tracking-[0.1em] uppercase text-sage-d block mb-4">Locație</span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-ink leading-tight">
            Ușor de ajuns <em className="text-sage-d not-italic">în {address.sector}</em>
          </h2>
        </div>

        <div className={grid}>
          {mapFirst ? (
            <>
              <div className="lg:order-1">
                <LocationMap config={config} />
              </div>
              <div className="lg:order-2">
                <LocationInfo config={config} />
              </div>
            </>
          ) : (
            <>
              <LocationInfo config={config} />
              <LocationMap config={config} />
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export function LocationA({ config }: { config: ClientConfig }) {
  return <LocationShell config={config} variant="a" className="location-a py-24 px-6 lg:px-10 bg-white" />
}
export function LocationB({ config }: { config: ClientConfig }) {
  return <LocationShell config={config} variant="b" className="location-b py-24 px-6 lg:px-10 bg-cream" />
}
export function LocationC({ config }: { config: ClientConfig }) {
  return <LocationShell config={config} variant="c" className="location-c py-24 px-6 lg:px-10 bg-sage-xl/25" mapFirst />
}
export function LocationD({ config }: { config: ClientConfig }) {
  return (
    <LocationShell
      config={config}
      variant="d"
      className="location-d py-24 px-6 lg:px-10 bg-white rounded-3xl border border-sage-l/20 max-w-[1180px] mx-auto my-8"
    />
  )
}
export function LocationE({ config }: { config: ClientConfig }) {
  return <LocationShell config={config} variant="e" className="location-e py-16 px-6 lg:px-10 bg-white" />
}
export function LocationF({ config }: { config: ClientConfig }) {
  return (
    <LocationShell
      config={config}
      variant="f"
      className="location-f py-24 px-6 lg:px-10 bg-gradient-to-b from-white to-sage-xl/30"
      mapFirst
    />
  )
}
