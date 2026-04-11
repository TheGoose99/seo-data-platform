import type { ClientConfig } from '@/types/client-config'

/** Reviews B — large quote + two stacked (reviews-b). */
export function ReviewsB({ config }: { config: ClientConfig }) {
  const highlight = config.reviews.find((r) => r.highlight) ?? config.reviews[0]
  const others = config.reviews.filter((r) => r.id !== highlight?.id).slice(0, 2)

  if (!highlight) return null

  return (
    <section id="cb-section-recenzii" data-cb-variant="b" className="reviews-b py-24 px-6 lg:px-10 bg-cream overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-14">
          <span className="text-xs font-medium tracking-[0.1em] uppercase text-sage-d">Recenzii Google</span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-ink mt-3">{config.content.reviewsTitle}</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-sage-l rounded-3xl p-10 lg:p-12">
            <div className="text-clay text-sm tracking-wider mb-5">{'★'.repeat(highlight.rating)}</div>
            <blockquote className="font-serif text-xl md:text-2xl text-ink leading-relaxed">„{highlight.text}”</blockquote>
            <div className="flex items-center gap-3 mt-8">
              <div className="w-10 h-10 rounded-full bg-sage-xl text-sage-d flex items-center justify-center text-sm font-semibold">
                {highlight.initials}
              </div>
              <div>
                <div className="text-sm font-medium text-ink">{highlight.author}</div>
                <div className="text-xs text-ink-xl">{highlight.timeAgo}</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {others.map((review) => (
              <div key={review.id} className="bg-white rounded-3xl p-7 border border-ink/5">
                <div className="text-clay text-sm tracking-wider mb-3">{'★'.repeat(review.rating)}</div>
                <blockquote className="font-serif text-sm text-ink-m leading-relaxed">„{review.text}”</blockquote>
                <div className="flex items-center gap-3 mt-5">
                  <div className="w-9 h-9 rounded-full bg-sage-xl text-sage-d flex items-center justify-center text-xs font-semibold">
                    {review.initials}
                  </div>
                  <div className="text-sm font-medium text-ink">{review.author}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
