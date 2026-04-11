import type { ClientConfig } from '@/types/client-config'

/** Reviews F — minimal list with left border accent. */
export function ReviewsF({ config }: { config: ClientConfig }) {
  return (
    <section id="cb-section-recenzii" data-cb-variant="f" className="reviews-f py-24 px-6 lg:px-10 bg-cream overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-12 max-w-xl">
          <span className="text-xs font-medium tracking-[0.1em] uppercase text-sage-d">Recenzii</span>
          <h2 className="font-serif text-4xl font-medium text-ink mt-3">{config.content.reviewsTitle}</h2>
        </div>
        <ul className="space-y-8">
          {config.reviews.map((review) => (
            <li key={review.id} className="border-l-4 border-sage-d pl-6 py-1">
              <p className="text-xs text-clay mb-2">{'★'.repeat(review.rating)}</p>
              <p className="text-ink-m leading-relaxed mb-3">{review.text}</p>
              <p className="text-sm font-medium text-ink">
                {review.author}
                <span className="text-ink-xl font-normal"> · {review.timeAgo}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
