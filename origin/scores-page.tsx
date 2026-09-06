import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { ClosingCta } from './closing-cta'
import { KpiTable } from './kpi-table'
import { LINKS } from './nav'
import { PageCrumb } from './page-crumb'
import { allScores, EST_CHARS_PER_TOKEN, formatScore, KPI_ASSUMPTIONS } from './scores'

export function ScoresPage() {
  const scores = allScores()
  return (
    <main>
      <PageCrumb current="Product KPIs" />
      <section className="w-full border-b bg-background">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-balance md:text-5xl">
            Product KPIs
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
            Origin is this repository today. These are planning numbers, not a
            pitch. Home stays in plain language.
          </p>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground text-pretty">
            Estimated tokens use {EST_CHARS_PER_TOKEN} characters per token, not a
            vendor tokenizer. API $ uses {KPI_ASSUMPTIONS.model} at $
            {KPI_ASSUMPTIONS.usd_per_million_input_tokens}/MTok input (
            {KPI_ASSUMPTIONS.source}, retrieved {KPI_ASSUMPTIONS.retrieved}). Hours
            use {KPI_ASSUMPTIONS.minutes_without} min without the product vs{' '}
            {KPI_ASSUMPTIONS.minutes_with} min with it, at $
            {KPI_ASSUMPTIONS.labour_usd_per_hour}/h — a working assumption, not a
            wage study. Re-measure with <code>npm run kpis</code>.
          </p>
        </div>
      </section>

      <section className="w-full border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
            KPIs (full)
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground text-pretty">
            Includes scaled cost, pack-vs-tree token upper bound, checkable-rule
            share, and the labour $ model that stays off the home page.
          </p>
          <div className="mt-10 overflow-x-auto">
            <KpiTable surface="ask" />
          </div>
        </div>
      </section>

      <section className="w-full border-b bg-background">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
            Inventory
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground text-pretty">
            Live counts and sizes. Useful for drift, not for sales claims.
          </p>
          <div className="mt-10 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Score</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Use in the product</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scores.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="align-top">
                      <p className="font-medium">{s.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        <code>{s.source}</code>
                      </p>
                    </TableCell>
                    <TableCell className="align-top tabular-nums">{formatScore(s)}</TableCell>
                    <TableCell className="align-top">
                      <Badge variant="secondary">{s.kind}</Badge>
                    </TableCell>
                    <TableCell className="align-top text-sm text-pretty text-muted-foreground">
                      {s.product_use}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      <ClosingCta
        title="Try the MVP"
        body="Start free with 2one’s look. Put your brand in on Customise."
        href={LINKS.pricing.href}
        label={LINKS.pricing.label}
      />
    </main>
  )
}
