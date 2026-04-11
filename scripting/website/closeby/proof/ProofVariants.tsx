import type { ClientConfig } from '@/types/client-config'
import type { HexVariant } from '@/types/client-config'

function proofItems(config: ClientConfig) {
  return [
    { value: `${config.yearsExperience}+`, label: 'ani de experiență' },
    { value: `${config.patientsHelped}+`, label: 'pacienți ajutați' },
    { value: `${config.aggregateRating.ratingValue}★`, label: 'rating Google' },
    { value: 'Acreditat', label: 'Colegiul Psihologilor' },
    { value: 'GDPR', label: 'Date pe servere EU' },
  ]
}

function ProofInnerBand({
  config,
  variant,
  className,
}: {
  config: ClientConfig
  variant: HexVariant
  className?: string
}) {
  const items = proofItems(config)
  return (
    <div id="cb-section-proof" data-cb-variant={variant} className={className}>
      <div className="max-w-[1200px] mx-auto flex flex-wrap gap-6 lg:gap-12 items-center justify-center lg:justify-start">
        {items.map((item, i) => (
          <div key={item.label} className="flex items-center gap-2 text-white/85 text-sm whitespace-nowrap">
            <strong className="font-serif text-xl font-semibold text-white">{item.value}</strong>
            {item.label}
            {i < items.length - 1 && <span className="hidden lg:inline text-white/25 ml-6 text-2xl">·</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function ProofInnerGrid({
  config,
  variant,
  className,
  valueClass,
}: {
  config: ClientConfig
  variant: HexVariant
  className?: string
  valueClass?: string
}) {
  const items = [
    { value: `${config.yearsExperience}+`, label: 'ani de experiență' },
    { value: `${config.patientsHelped}+`, label: 'pacienți ajutați' },
    { value: `${config.aggregateRating.ratingValue}★`, label: 'rating Google' },
    { value: 'CPR', label: 'acreditat' },
    { value: 'EU', label: 'servere GDPR' },
  ]
  return (
    <div id="cb-section-proof" data-cb-variant={variant} className={className}>
      <div className="max-w-[1120px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-6">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <span className={`font-serif text-3xl font-semibold block ${valueClass ?? 'text-sage-d'}`}>{item.value}</span>
            <span className="text-xs text-ink-l mt-1 block">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProofA({ config }: { config: ClientConfig }) {
  return <ProofInnerBand config={config} variant="a" className="proof-a bg-sage-d py-5 px-6 lg:px-10 overflow-hidden" />
}

export function ProofB({ config }: { config: ClientConfig }) {
  return (
    <ProofInnerGrid
      config={config}
      variant="b"
      className="proof-b bg-cream py-10 px-6 border-y border-ink/5"
    />
  )
}

export function ProofC({ config }: { config: ClientConfig }) {
  return (
    <ProofInnerBand
      config={config}
      variant="c"
      className="proof-c bg-ink py-6 px-6 lg:px-10 overflow-hidden border-y border-white/10"
    />
  )
}

export function ProofD({ config }: { config: ClientConfig }) {
  return (
    <ProofInnerGrid
      config={config}
      variant="d"
      className="proof-d bg-white py-8 px-6 border-y border-sage-l/30"
    />
  )
}

export function ProofE({ config }: { config: ClientConfig }) {
  return (
    <ProofInnerGrid
      config={config}
      variant="e"
      className="proof-e bg-sage-xl/80 py-10 px-6 backdrop-blur-sm"
      valueClass="text-ink"
    />
  )
}

export function ProofF({ config }: { config: ClientConfig }) {
  return (
    <ProofInnerBand
      config={config}
      variant="f"
      className="proof-f bg-gradient-to-r from-sage-d via-sage to-sage-d py-6 px-6 lg:px-10 overflow-hidden"
    />
  )
}
