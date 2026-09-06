import { HOME_FAQ, PRODUCT_PARTS } from './content'
import { Audiences } from './audiences'
import { ClosingCta } from './closing-cta'
import { Differentiators } from './differentiators'
import { GraphShowcase } from './graph-showcase'
import { HomeHero } from './home-hero'
import { HowItWorks } from './how-it-works'
import { Market } from './market'
import { Versus } from './versus'
import { OriginAndServices } from './origin-and-services'
import { SiteFaq } from './site-faq'
import { LINKS } from './nav'

export function HomePage() {
  return (
    <main>
      <HomeHero />
      <Differentiators />
      <Audiences />
      <HowItWorks />

      <section className="w-full border-b bg-background">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
              What you get
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              What you already have, in one product, so the next screen does not
              start from a guess.
            </p>
          </div>
          <div className="mt-14 grid gap-x-10 gap-y-9 border-t pt-10 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCT_PARTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-3">
                <Icon className="size-5 text-muted-foreground" aria-hidden />
                <h3 className="font-semibold tracking-tight">{title}</h3>
                <p className="text-sm text-muted-foreground text-pretty">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GraphShowcase />
      <Versus />
      <Market />
      <OriginAndServices />
      <SiteFaq heading="Common questions" items={HOME_FAQ} />

      <ClosingCta
        title="Stop guessing the look"
        body="Start free on 2one’s brand. Put yours in on Customise. Keep Figma if you still sketch."
        href={LINKS.pricing.href}
        label={LINKS.pricing.label}
      />
    </main>
  )
}
