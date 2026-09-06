import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { KnowledgeGraph } from './knowledge-graph'

import { LINKS } from './nav'

export function GraphShowcase() {
  return (
    <section aria-labelledby="graph-showcase-heading" className="w-full border-b bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Knowledge engine
          </p>
          <h2
            id="graph-showcase-heading"
            className="mt-2 text-3xl font-bold tracking-tight text-balance md:text-4xl"
          >
            See what a change will hit
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            You change a token or a component and find the fallout in QA. Click a
            node here to see what it touches, before you ship.
          </p>
        </div>
        <div className="mt-12">
          <KnowledgeGraph />
        </div>
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline">
            <a href={LINKS.graph.href}>
              {LINKS.graph.label} <ArrowRight />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
