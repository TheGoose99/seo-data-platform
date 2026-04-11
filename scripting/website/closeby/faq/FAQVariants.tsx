import type { ClientConfig } from '@/types/client-config'
import type { HexVariant } from '@/types/client-config'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { buildWhatsAppUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'

function FaqContactBlocks({ config }: { config: ClientConfig }) {
  const waUrl = buildWhatsAppUrl(
    config.integrations.whatsappNumber ?? '',
    'Bună ziua, am o întrebare despre serviciile dumneavoastră.'
  )
  return (
    <div className="space-y-4">
      <a
        href={`tel:${config.phone}`}
        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-sage-l/30 hover:border-sage-d hover:shadow-md transition-all duration-200"
      >
        <div className="w-10 h-10 rounded-lg bg-sage-xl flex items-center justify-center text-lg flex-shrink-0">📞</div>
        <div>
          <div className="text-sm font-medium text-ink">{config.phoneDisplay}</div>
          <div className="text-xs text-ink-l mt-0.5">{config.openingHoursDisplay}</div>
        </div>
      </a>
      <a
        href={`mailto:${config.email}`}
        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-sage-l/30 hover:border-sage-d hover:shadow-md transition-all duration-200"
      >
        <div className="w-10 h-10 rounded-lg bg-sage-xl flex items-center justify-center text-lg flex-shrink-0">✉️</div>
        <div>
          <div className="text-sm font-medium text-ink">{config.email}</div>
          <div className="text-xs text-ink-l mt-0.5">Răspund în 24 de ore</div>
        </div>
      </a>
      {config.integrations.whatsappNumber ? (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-sage-l/30 hover:border-sage-d hover:shadow-md transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-lg bg-sage-xl flex items-center justify-center text-lg flex-shrink-0">💬</div>
          <div>
            <div className="text-sm font-medium text-ink">WhatsApp</div>
            <div className="text-xs text-ink-l mt-0.5">Răspund în max. 2 ore în zilele lucrătoare</div>
          </div>
        </a>
      ) : null}
    </div>
  )
}

function FaqSidebar({ config }: { config: ClientConfig }) {
  return (
    <div className="flex flex-col justify-center">
      <h3 className="font-serif text-3xl font-medium text-ink mb-4">
        {config.content.faqSidebarLead}{' '}
        <em className="text-sage-d not-italic">{config.content.faqSidebarEmphasis}</em>
      </h3>
      <p className="text-ink-l text-[0.9375rem] mb-8 leading-relaxed">{config.content.faqSidebarSubtitle}</p>
      <FaqContactBlocks config={config} />
    </div>
  )
}

function FaqColumn({ config }: { config: ClientConfig }) {
  return (
    <div>
      <span className="text-xs font-medium tracking-[0.1em] uppercase text-sage-d block mb-4">{config.content.faqEyebrow}</span>
      <h2 className="font-serif text-4xl md:text-5xl font-medium text-ink mb-10">{config.content.faqTitle}</h2>
      <FAQAccordion faqs={config.faqs} />
    </div>
  )
}

function FAQShell({ config, variant }: { config: ClientConfig; variant: HexVariant }) {
  const shells: Record<HexVariant, string> = {
    a: 'faq-a py-24 px-6 lg:px-10 bg-cream',
    b: 'faq-b py-24 px-6 lg:px-10 bg-white',
    c: 'faq-c py-24 px-6 lg:px-10 bg-sage-xl/40',
    d: 'faq-d py-24 px-6 lg:px-10 bg-cream border-y border-sage-l/20',
    e: 'faq-e py-20 px-6 lg:px-10 bg-white',
    f: 'faq-f py-24 px-6 lg:px-10 bg-gradient-to-b from-cream to-white',
  }

  const twoCol = 'grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16'

  if (variant === 'b') {
    return (
      <section id="cb-section-faq" data-cb-variant={variant} className={shells[variant]}>
        <div className="max-w-[1200px] mx-auto">
          <FaqColumn config={config} />
          <div className="mt-12 border-t border-sage-l/30 pt-12">
            <FaqSidebar config={config} />
          </div>
        </div>
      </section>
    )
  }

  const main =
    variant === 'd' ? (
      <div className={twoCol}>
        <div className="lg:order-2">
          <FaqColumn config={config} />
        </div>
        <div className="lg:order-1">
          <FaqSidebar config={config} />
        </div>
      </div>
    ) : (
      <div className={cn(twoCol, variant === 'e' && 'lg:grid-cols-[1.15fr_0.85fr]', variant === 'f' && 'gap-10')}>
        <FaqColumn config={config} />
        <FaqSidebar config={config} />
      </div>
    )

  return (
    <section id="cb-section-faq" data-cb-variant={variant} className={shells[variant]}>
      <div className="max-w-[1200px] mx-auto">{main}</div>
    </section>
  )
}

export function FAQSectionA({ config }: { config: ClientConfig }) {
  return <FAQShell config={config} variant="a" />
}
export function FAQSectionB({ config }: { config: ClientConfig }) {
  return <FAQShell config={config} variant="b" />
}
export function FAQSectionC({ config }: { config: ClientConfig }) {
  return <FAQShell config={config} variant="c" />
}
export function FAQSectionD({ config }: { config: ClientConfig }) {
  return <FAQShell config={config} variant="d" />
}
export function FAQSectionE({ config }: { config: ClientConfig }) {
  return <FAQShell config={config} variant="e" />
}
export function FAQSectionF({ config }: { config: ClientConfig }) {
  return <FAQShell config={config} variant="f" />
}
