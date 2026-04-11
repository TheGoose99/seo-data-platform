import type { ClientConfig } from '@/types/client-config'
import { cn } from '@/lib/utils'

/** Reviews C — dense 2×2 grid. */
export function ReviewsC({ config }: { config: ClientConfig }) {
  return (
    <section id="cb-section-recenzii" data-cb-variant="c" className="reviews-c py-24 px-6 lg:px-10 bg-cream overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-10">
          <span className="text-xs font-medium tracking-[0.1em] uppercase text-sage-d">Recenzii Google</span>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-ink mt-2">{config.content.reviewsTitle}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {config.reviews.slice(0, 4).map((review) => (
            <div key={review.id} className={cn('rounded-xl p-5 border', review.highlight ? 'bg-sage-d text-white border-transparent' : 'bg-white border-sage-l/25')}>
              <div className={cn('text-xs tracking-wider mb-2', review.highlight ? 'text-yellow-200' : 'text-clay')}>
                {'★'.repeat(review.rating)}
              </div>
              <blockquote className={cn('font-serif text-sm italic leading-relaxed', review.highlight ? 'text-white/90' : 'text-ink-m')}>
                „{review.text.slice(0, 180)}
                {review.text.length > 180 ? '…' : ''}”
              </blockquote>
              <div className="flex items-center gap-2 mt-4">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
                    review.highlight ? 'bg-white/20' : 'bg-sage-xl text-sage-d'
                  )}
                >
                  {review.initials}
                </div>
                <div className={cn('text-xs font-medium', review.highlight ? 'text-white/80' : 'text-ink')}>{review.author}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
