import type { ClientConfig } from '@/types/client-config'
import { cn } from '@/lib/utils'

/** Reviews E — single column alternating bands. */
export function ReviewsE({ config }: { config: ClientConfig }) {
  return (
    <section id="cb-section-recenzii" data-cb-variant="e" className="reviews-e py-24 px-6 lg:px-10 bg-white overflow-hidden">
      <div className="max-w-[640px] mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl font-medium text-ink mb-12 text-center">{config.content.reviewsTitle}</h2>
        <div className="divide-y divide-sage-l/25">
          {config.reviews.map((review, i) => (
            <div key={review.id} className={cn('py-8', i % 2 === 0 ? 'bg-transparent' : 'bg-cream/50 -mx-6 px-6 rounded-xl')}>
              <div className="text-clay text-sm tracking-wider mb-3">{'★'.repeat(review.rating)}</div>
              <blockquote className="font-serif text-lg italic text-ink-m leading-relaxed mb-4">„{review.text}”</blockquote>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sage-xl text-sage-d flex items-center justify-center text-xs font-semibold">
                  {review.initials}
                </div>
                <div>
                  <div className="text-sm font-medium text-ink">{review.author}</div>
                  <div className="text-xs text-ink-xl">{review.timeAgo}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
