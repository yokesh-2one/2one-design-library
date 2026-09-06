import { KpiTable } from './kpi-table'
import { LINKS } from './nav'
import { KPI_ASSUMPTIONS } from './scores'

export function MarketingKpis() {
  return (
    <section className="w-full border-b bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-4xl">
          Why connect the repo instead of dumping a file
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
          Estimated tokens and API input $ for querying Origin versus dumping
          graph.json or src. Hours are a review-load model. Rate card:{' '}
          {KPI_ASSUMPTIONS.model}, ${KPI_ASSUMPTIONS.usd_per_million_input_tokens}/MTok
          input, retrieved {KPI_ASSUMPTIONS.retrieved}. Not Origin licence pricing.
        </p>
        <div className="mt-10 overflow-x-auto">
          <KpiTable surface="marketing" />
        </div>
        <p className="mt-6 text-sm text-muted-foreground text-pretty">
          Method, pack-vs-tree upper bound, and inventory counts:{' '}
          <a href={LINKS.scores.href} className="underline-offset-4 hover:underline">
            {LINKS.scores.label}
          </a>
          . Re-measure with <code>npm run kpis</code> when we test.
        </p>
      </div>
    </section>
  )
}
