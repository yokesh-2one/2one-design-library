import { ArrowRight } from 'lucide-react'

import { MediaPlaceholder } from '@/components/media-placeholder'
import { Button } from '@/components/ui/button'

import { LINKS } from './nav'

export function HomeHero() {
  return (
    <section className="w-full border-b bg-background">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div className="flex flex-col items-start gap-6">
          <h1 className="max-w-xl text-4xl font-bold tracking-tight text-balance md:text-6xl">
            Stop shipping two brands by accident.
          </h1>
          <p className="max-w-md text-lg text-muted-foreground text-pretty">
            AI and two teams will invent a look if the brand is scattered. Origin
            holds it in one place so the next product screen and the next marketing
            page match. Sketch on a canvas if you still draw. The MVP is this
            repository.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <a href={LINKS.pricing.href}>
                Start free <ArrowRight />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href={LINKS.product.href}>{LINKS.product.label}</a>
            </Button>
          </div>
        </div>
        <MediaPlaceholder label="Origin product preview" />
      </div>
    </section>
  )
}
