import { MarketingSite } from '@/patterns/marketing-site'
import { MarketingHero } from '@/blocks/marketing/hero'
import { MarketingFeatureGrid } from '@/blocks/marketing/feature-grid'
import { MarketingCtaBanner } from '@/blocks/marketing/cta-banner'

/*
  The marketing-site shell wrapping a real page — sticky SiteHeader (brand + nav +
  ThemeToggle + outline Contact), the existing marketing blocks as content, and the
  shared MarketingFooter. Exercises the Phase B pattern under visual + a11y testing.
  Deterministic (static block copy; the harness freezes the clock).
*/
export function MarketingSiteScreen() {
  return (
    <MarketingSite siteName="2one" activeHref="/product">
      <MarketingHero />
      <MarketingFeatureGrid />
      <MarketingCtaBanner />
    </MarketingSite>
  )
}
