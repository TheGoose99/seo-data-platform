import Image from 'next/image'
import type { ClientConfig } from '@/types/client-config'
import type { HexVariant } from '@/types/client-config'
import { cn } from '@/lib/utils'

function GalleryShell({
  config,
  variant,
  gridClass,
  sectionClass,
}: {
  config: Pick<ClientConfig, 'images' | 'shortName' | 'content'>
  variant: HexVariant
  gridClass: string
  sectionClass: string
}) {
  const images = config.images.gallery ?? []
  if (images.length === 0) return null

  return (
    <section id="cb-section-galerie" data-cb-variant={variant} className={sectionClass}>
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-10">
          <span className="text-xs font-medium tracking-[0.1em] uppercase text-sage-d">Cabinet</span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-ink mt-3">{config.content.galleryTitle}</h2>
          <p className="text-ink-l mt-3 max-w-2xl">{config.content.gallerySubtitle}</p>
        </div>

        <div className={gridClass}>
          {images.slice(0, 6).map((src, idx) => (
            <div key={`${src}-${idx}`} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-sage-xl">
              <Image
                src={src}
                alt={`Cabinet ${config.shortName} — foto ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 380px"
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function GalleryA({ config }: { config: Pick<ClientConfig, 'images' | 'shortName' | 'content'> }) {
  return (
    <GalleryShell
      config={config}
      variant="a"
      sectionClass="gallery-a py-24 px-6 lg:px-10 bg-cream"
      gridClass="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
    />
  )
}

export function GalleryB({ config }: { config: Pick<ClientConfig, 'images' | 'shortName' | 'content'> }) {
  return (
    <GalleryShell
      config={config}
      variant="b"
      sectionClass="gallery-b py-24 px-6 lg:px-10 bg-white"
      gridClass="grid grid-cols-1 sm:grid-cols-2 gap-6"
    />
  )
}

export function GalleryC({ config }: { config: Pick<ClientConfig, 'images' | 'shortName' | 'content'> }) {
  return (
    <GalleryShell
      config={config}
      variant="c"
      sectionClass="gallery-c py-24 px-6 lg:px-10 bg-sage-xl/20"
      gridClass="grid grid-cols-2 lg:grid-cols-3 gap-3"
    />
  )
}

export function GalleryD({ config }: { config: Pick<ClientConfig, 'images' | 'shortName' | 'content'> }) {
  return (
    <GalleryShell
      config={config}
      variant="d"
      sectionClass="gallery-d py-24 px-6 lg:px-10 bg-cream"
      gridClass="grid grid-cols-1 max-w-xl mx-auto gap-6"
    />
  )
}

export function GalleryE({ config }: { config: Pick<ClientConfig, 'images' | 'shortName' | 'content'> }) {
  return (
    <GalleryShell
      config={config}
      variant="e"
      sectionClass={cn('gallery-e py-24 px-6 lg:px-10 border-y border-sage-l/25 bg-white')}
      gridClass="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    />
  )
}

export function GalleryF({ config }: { config: Pick<ClientConfig, 'images' | 'shortName' | 'content'> }) {
  return (
    <GalleryShell
      config={config}
      variant="f"
      sectionClass="gallery-f py-20 px-4 lg:px-10 bg-gradient-to-br from-cream via-white to-sage-xl/30"
      gridClass="grid grid-cols-2 md:grid-cols-3 gap-4"
    />
  )
}
