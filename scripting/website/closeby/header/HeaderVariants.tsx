'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { ClientConfig } from '@/types/client-config'

const NAV_LINKS = [
  { href: '#despre', label: 'Despre' },
  { href: '#servicii', label: 'Servicii' },
  { href: '#recenzii', label: 'Recenzii' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
]

type HeaderProps = { config: Pick<ClientConfig, 'shortName' | 'phone' | 'phoneDisplay'> }

function useHeaderChrome() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  return { scrolled, menuOpen, setMenuOpen }
}

function Logo({
  config,
  variant,
}: HeaderProps & { variant: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' }) {
  const [first, ...rest] = config.shortName.split(' ')
  const restStr = rest.join(' ')
  if (variant === 'b' || variant === 'e') {
    return (
      <Link href="/" className="font-serif text-xl font-semibold text-white tracking-tight truncate max-w-[60vw]">
        {first} <span className="text-sage-l">{restStr}</span>
      </Link>
    )
  }
  if (variant === 'd') {
    return (
      <Link
        href="/"
        className="font-serif text-xl font-semibold text-ink tracking-tight truncate max-w-[60vw] hover:opacity-[0.85] transition-opacity"
      >
        {first} <span className="text-sage-d">{restStr}</span>
      </Link>
    )
  }
  return (
    <Link href="/" className="font-serif text-xl font-semibold text-ink tracking-tight truncate max-w-[60vw]">
      {first} <span className="text-sage-d">{restStr}</span>
    </Link>
  )
}

/** Header A — cream + blur (header-a). */
export function HeaderA({ config }: HeaderProps) {
  const { scrolled, menuOpen, setMenuOpen } = useHeaderChrome()

  return (
    <header
      id="cb-section-header"
      data-cb-variant="a"
      className={cn(
        'header-a fixed top-0 left-0 right-0 z-40 transition-shadow duration-300',
        'bg-cream/90 backdrop-blur-md border-b border-sage/10',
        scrolled && 'shadow-[0_2px_20px_rgba(26,32,24,0.08)]'
      )}
    >
      <nav className="max-w-[1200px] mx-auto flex items-center justify-between h-16 px-6 lg:px-10">
        <Logo config={config} variant="a" />
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-ink-m hover:text-sage-d transition-colors">
              {l.label}
            </a>
          ))}
        </div>
        <a
          href="#programare"
          className="hidden md:inline-flex items-center gap-1.5 bg-sage-d text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-ink transition-all duration-200 hover:-translate-y-px"
        >
          Programează-te →
        </a>
        <div className="flex md:hidden items-center gap-3">
          <a href={`tel:${config.phone}`} className="flex items-center gap-1.5 bg-sage-d text-white text-sm font-medium px-4 py-2 rounded-full">
            📞 Sună
          </a>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-ink-m" aria-label="Meniu">
            <div className="space-y-1.5">
              <span className={cn('block w-5 h-0.5 bg-current transition-transform', menuOpen && 'rotate-45 translate-y-2')} />
              <span className={cn('block w-5 h-0.5 bg-current transition-opacity', menuOpen && 'opacity-0')} />
              <span className={cn('block w-5 h-0.5 bg-current transition-transform', menuOpen && '-rotate-45 -translate-y-2')} />
            </div>
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="md:hidden bg-cream border-t border-sage/10 px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-base text-ink-m py-1">
              {l.label}
            </a>
          ))}
          <a href="#programare" onClick={() => setMenuOpen(false)} className="bg-sage-d text-white text-center py-3 rounded-full font-medium mt-2">
            Programează-te →
          </a>
        </div>
      )}
    </header>
  )
}

/** Header B — dark ink (header-b). */
export function HeaderB({ config }: HeaderProps) {
  const { scrolled, menuOpen, setMenuOpen } = useHeaderChrome()

  return (
    <header
      id="cb-section-header"
      data-cb-variant="b"
      className={cn(
        'header-b fixed top-0 left-0 right-0 z-40 transition-shadow duration-300 bg-ink border-b border-white/10',
        scrolled && 'shadow-lg'
      )}
    >
      <nav className="max-w-[1200px] mx-auto flex items-center justify-between h-16 px-6 lg:px-10">
        <Logo config={config} variant="b" />
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
        </div>
        <a
          href="#programare"
          className="hidden md:inline-flex items-center gap-1.5 bg-white text-ink text-sm font-medium px-5 py-2.5 rounded-full hover:bg-sage-l transition-all"
        >
          Programează-te →
        </a>
        <div className="flex md:hidden items-center gap-3">
          <a href={`tel:${config.phone}`} className="flex items-center gap-1.5 bg-sage-d text-white text-sm font-medium px-4 py-2 rounded-full">
            📞 Sună
          </a>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-white/80" aria-label="Meniu">
            <div className="space-y-1.5">
              <span className={cn('block w-5 h-0.5 bg-current transition-transform', menuOpen && 'rotate-45 translate-y-2')} />
              <span className={cn('block w-5 h-0.5 bg-current transition-opacity', menuOpen && 'opacity-0')} />
              <span className={cn('block w-5 h-0.5 bg-current transition-transform', menuOpen && '-rotate-45 -translate-y-2')} />
            </div>
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="md:hidden bg-ink border-t border-white/10 px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-base text-white/80 py-1">
              {l.label}
            </a>
          ))}
          <a href="#programare" onClick={() => setMenuOpen(false)} className="bg-white text-ink text-center py-3 rounded-full font-medium mt-2">
            Programează-te →
          </a>
        </div>
      )}
    </header>
  )
}

/** Header C — white + primary underline (header-c). */
export function HeaderC({ config }: HeaderProps) {
  const { scrolled, menuOpen, setMenuOpen } = useHeaderChrome()

  return (
    <header
      id="cb-section-header"
      data-cb-variant="c"
      className={cn(
        'header-c fixed top-0 left-0 right-0 z-40 bg-white border-b-2 border-sage-d transition-shadow duration-300',
        scrolled && 'shadow-sm'
      )}
    >
      <nav className="max-w-[1200px] mx-auto flex items-center justify-between h-16 px-6 lg:px-10">
        <Logo config={config} variant="a" />
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-ink-m hover:text-sage-d transition-colors">
              {l.label}
            </a>
          ))}
        </div>
        <a
          href="#programare"
          className="hidden md:inline-flex items-center gap-1.5 bg-sage-d text-white text-sm font-medium px-5 py-2.5 rounded-none hover:bg-ink transition-all"
        >
          Programează-te →
        </a>
        <div className="flex md:hidden items-center gap-3">
          <a href={`tel:${config.phone}`} className="flex items-center gap-1.5 bg-sage-d text-white text-sm font-medium px-4 py-2 rounded-full">
            📞 Sună
          </a>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-ink-m" aria-label="Meniu">
            <div className="space-y-1.5">
              <span className={cn('block w-5 h-0.5 bg-current transition-transform', menuOpen && 'rotate-45 translate-y-2')} />
              <span className={cn('block w-5 h-0.5 bg-current transition-opacity', menuOpen && 'opacity-0')} />
              <span className={cn('block w-5 h-0.5 bg-current transition-transform', menuOpen && '-rotate-45 -translate-y-2')} />
            </div>
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-sage/10 px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-base text-ink-m py-1">
              {l.label}
            </a>
          ))}
          <a href="#programare" onClick={() => setMenuOpen(false)} className="bg-sage-d text-white text-center py-3 rounded-full font-medium mt-2">
            Programează-te →
          </a>
        </div>
      )}
    </header>
  )
}

/** Header D — underline nav accents (header-d). */
export function HeaderD({ config }: HeaderProps) {
  const { scrolled, menuOpen, setMenuOpen } = useHeaderChrome()

  return (
    <header
      id="cb-section-header"
      data-cb-variant="d"
      className={cn(
        'header-d fixed top-0 left-0 right-0 z-40 transition-shadow duration-300',
        'bg-cream/95 backdrop-blur-sm border-b border-sage-l/20',
        scrolled && 'shadow-sm'
      )}
    >
      <nav className="max-w-[1200px] mx-auto flex items-center justify-between h-16 px-6 lg:px-10">
        <Logo config={config} variant="d" />
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-ink-m border-b-2 border-transparent pb-0.5 hover:border-sage-d hover:text-sage-d transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
        <a
          href="#programare"
          className="hidden md:inline-flex items-center gap-1.5 bg-sage-d text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-ink transition-all duration-200"
        >
          Programează-te →
        </a>
        <div className="flex md:hidden items-center gap-3">
          <a href={`tel:${config.phone}`} className="flex items-center gap-1.5 bg-sage-d text-white text-sm font-medium px-4 py-2 rounded-full">
            📞 Sună
          </a>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-ink-m" aria-label="Meniu">
            <div className="space-y-1.5">
              <span className={cn('block w-5 h-0.5 bg-current transition-transform', menuOpen && 'rotate-45 translate-y-2')} />
              <span className={cn('block w-5 h-0.5 bg-current transition-opacity', menuOpen && 'opacity-0')} />
              <span className={cn('block w-5 h-0.5 bg-current transition-transform', menuOpen && '-rotate-45 -translate-y-2')} />
            </div>
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="md:hidden bg-cream border-t border-sage/10 px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-base text-ink-m py-1">
              {l.label}
            </a>
          ))}
          <a href="#programare" onClick={() => setMenuOpen(false)} className="bg-sage-d text-white text-center py-3 rounded-full font-medium mt-2">
            Programează-te →
          </a>
        </div>
      )}
    </header>
  )
}

/** Header E — sage panel (header-e). */
export function HeaderE({ config }: HeaderProps) {
  const { scrolled, menuOpen, setMenuOpen } = useHeaderChrome()

  return (
    <header
      id="cb-section-header"
      data-cb-variant="e"
      className={cn(
        'header-e fixed top-0 left-0 right-0 z-40 transition-shadow duration-300 bg-sage-d border-b border-white/10',
        scrolled && 'shadow-md'
      )}
    >
      <nav className="max-w-[1200px] mx-auto flex items-center justify-between h-16 px-6 lg:px-10">
        <Logo config={config} variant="e" />
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-white/75 hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
        </div>
        <a
          href="#programare"
          className="hidden md:inline-flex items-center gap-1.5 bg-white text-sage-d text-sm font-medium px-5 py-2.5 rounded-full hover:bg-sage-l transition-all"
        >
          Programează-te →
        </a>
        <div className="flex md:hidden items-center gap-3">
          <a href={`tel:${config.phone}`} className="flex items-center gap-1.5 bg-white text-sage-d text-sm font-medium px-4 py-2 rounded-full">
            📞 Sună
          </a>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-white/80" aria-label="Meniu">
            <div className="space-y-1.5">
              <span className={cn('block w-5 h-0.5 bg-current transition-transform', menuOpen && 'rotate-45 translate-y-2')} />
              <span className={cn('block w-5 h-0.5 bg-current transition-opacity', menuOpen && 'opacity-0')} />
              <span className={cn('block w-5 h-0.5 bg-current transition-transform', menuOpen && '-rotate-45 -translate-y-2')} />
            </div>
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="md:hidden bg-sage-d border-t border-white/10 px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-base text-white/80 py-1">
              {l.label}
            </a>
          ))}
          <a href="#programare" onClick={() => setMenuOpen(false)} className="bg-white text-sage-d text-center py-3 rounded-full font-medium mt-2">
            Programează-te →
          </a>
        </div>
      )}
    </header>
  )
}

/** Header F — compact glass bar (header-f). */
export function HeaderF({ config }: HeaderProps) {
  const { scrolled, menuOpen, setMenuOpen } = useHeaderChrome()

  return (
    <header
      id="cb-section-header"
      data-cb-variant="f"
      className={cn(
        'header-f fixed top-0 left-0 right-0 z-40 h-14 flex flex-col transition-shadow duration-300',
        'bg-white/95 backdrop-blur-md border-b border-sage-l/15',
        scrolled && 'shadow-[0_1px_12px_rgba(26,32,24,0.06)]'
      )}
    >
      <nav className="max-w-[1200px] mx-auto flex items-center justify-between h-14 px-5 lg:px-10 flex-1 min-h-0">
        <Logo config={config} variant="f" />
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-xs font-medium uppercase tracking-wide text-ink-m hover:text-sage-d transition-colors">
              {l.label}
            </a>
          ))}
        </div>
        <a
          href="#programare"
          className="hidden md:inline-flex items-center gap-1 bg-sage-d text-white text-xs font-medium px-4 py-2 rounded-full hover:bg-ink transition-colors"
        >
          Programează-te
        </a>
        <div className="flex md:hidden items-center gap-2">
          <a href={`tel:${config.phone}`} className="flex items-center gap-1 bg-sage-d text-white text-xs font-medium px-3 py-1.5 rounded-full">
            📞
          </a>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 text-ink-m" aria-label="Meniu">
            <div className="space-y-1">
              <span className={cn('block w-4 h-0.5 bg-current transition-transform', menuOpen && 'rotate-45 translate-y-1.5')} />
              <span className={cn('block w-4 h-0.5 bg-current transition-opacity', menuOpen && 'opacity-0')} />
              <span className={cn('block w-4 h-0.5 bg-current transition-transform', menuOpen && '-rotate-45 -translate-y-1.5')} />
            </div>
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-sage/10 px-6 py-3 flex flex-col gap-3 text-sm">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-ink-m py-1">
              {l.label}
            </a>
          ))}
          <a href="#programare" onClick={() => setMenuOpen(false)} className="bg-sage-d text-white text-center py-2.5 rounded-full font-medium">
            Programează-te →
          </a>
        </div>
      )}
    </header>
  )
}
