'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { MarketingFooter } from '@/blocks/marketing/footer'

/*
  Marketing site shell — a PAGE PATTERN (Tier 3): the chrome a multi-page marketing
  site needs, so a builder wraps page content in one sticky header + shared footer
  instead of hand-rolling site chrome per page.

  It is CHROME only. The page's own sections are the existing marketing blocks —
  hero (blocks/marketing/hero), closing CTA (blocks/marketing/cta-banner), a crumb
  (the Breadcrumb primitive) — placed as children. There is exactly ONE footer: the
  shared MarketingFooter block, reused here (not a second, competing footer).

  Standards it encodes: the brand is the Logo COMPONENT (never typeset), theme-adaptive
  black/white; the product name is a nav LABEL, never set beside the wordmark; the
  chrome carries NO primary Button (Contact is outline) so a page's own primary is never
  shadowed; the active destination is aria-current + weight, never colour alone; links
  are underlined on hover with --brand for emphasis, never colour alone; a ThemeToggle
  switches the audited light/dark set. Machine-readable spec: rules/patterns/marketing-site.json.
*/

export interface SiteNavItem {
  label: string
  /** Destination URL. The same href must carry the same label across the chrome. */
  href: string
}

const DEFAULT_NAV: SiteNavItem[] = [
  { label: 'Product', href: '/product' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Docs', href: '/docs' },
  { label: 'About', href: '/about' },
]

export interface SiteHeaderProps {
  /** Accessible name for the brand home link (the wordmark is the Logo asset, never typeset). */
  siteName?: string
  /** Home target for the brand mark. */
  homeHref?: string
  nav?: SiteNavItem[]
  /** href of the current page — marked with aria-current + weight, never colour alone. */
  activeHref?: string
  /** The single outline chrome action. */
  contactHref?: string
  contactLabel?: string
}

export function SiteHeader({
  siteName = '2one',
  homeHref = '/',
  nav = DEFAULT_NAV,
  activeHref,
  contactHref = '/contact',
  contactLabel = 'Contact',
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        <a
          href={homeHref}
          aria-label={siteName}
          className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo variant="black" width={64} className="dark:hidden" />
          <Logo variant="white" width={64} className="hidden dark:block" />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active = item.href === activeHref
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-md px-3 py-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active && 'font-medium text-foreground',
                )}
              >
                {item.label}
              </a>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline">
            <a href={contactHref}>{contactLabel}</a>
          </Button>
        </div>
      </div>
    </header>
  )
}

export interface MarketingSiteProps extends SiteHeaderProps {
  /** Page content — compose from the marketing blocks (hero, feature-grid, cta-banner, …). */
  children?: React.ReactNode
}

/**
 * The full shell: sticky SiteHeader, a content region for the page's marketing
 * blocks, and the shared MarketingFooter. Pass the page's `activeHref` so the
 * header marks the current destination.
 */
export function MarketingSite({ children, ...header }: MarketingSiteProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader {...header} />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  )
}
