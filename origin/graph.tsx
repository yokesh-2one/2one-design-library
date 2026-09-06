import { Bar, BarChart, XAxis, YAxis } from 'recharts'

import { Badge } from '@/components/ui/badge'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Kbd } from '@/components/ui/kbd'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { ClosingCta } from './closing-cta'
import { KIND_LABEL, type NodeKind } from './graph-data'
import { liveDecisions, topNodeTypes } from './graph-snapshot'
import { KnowledgeGraph, KIND_ICON } from './knowledge-graph'
import { LINKS } from './nav'
import { PageCrumb } from './page-crumb'

const INTENT_IDS = ['intent:present-pricing', 'intent:primary-action', 'intent:submit-form']
const KINDS = Object.keys(KIND_LABEL) as NodeKind[]

const chartConfig = {
  count: { label: 'Nodes', color: 'var(--chart-1)' },
} satisfies ChartConfig

export function GraphPage() {
  const chartData = topNodeTypes(5).map((r) => ({ type: r.type, count: r.count }))
  const decisions = liveDecisions(INTENT_IDS)

  return (
    <main>
      <PageCrumb current="How it works" />
      <section aria-labelledby="explorer-heading" className="w-full border-b bg-background">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
              Knowledge engine
            </p>
            <h1
              id="explorer-heading"
              className="mt-4 text-4xl font-bold tracking-tight text-balance md:text-5xl"
            >
              Same request. Same screen.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              This is how Origin keeps two people from inventing two layouts.
              Click a node to see what a rule or component touches. Commands to
              run the same idea in a repo are below. This is not a drawing board.
            </p>
          </div>
          <p className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {KINDS.map((k) => {
              const Icon = KIND_ICON[k]
              return (
                <span key={k} className="inline-flex items-center gap-1.5">
                  <Icon className="size-3.5" aria-hidden />
                  {KIND_LABEL[k]}
                </span>
              )
            })}
          </p>
          <div className="mt-10">
            <KnowledgeGraph />
          </div>
        </div>
      </section>

      <section className="w-full border-b bg-muted/30">
        <div className="mx-auto grid max-w-7xl items-end gap-12 px-6 py-20 md:grid-cols-2 md:py-24">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
              What the engine is made of
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              Top five kinds of thing it knows. Technical on purpose.
            </p>
          </div>
          <ChartContainer config={chartConfig} className="h-[250px] w-full min-w-0">
            <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 12 }}>
              <XAxis type="number" dataKey="count" hide />
              <YAxis dataKey="type" type="category" tickLine={false} axisLine={false} width={120} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={5} />
            </BarChart>
          </ChartContainer>
        </div>
      </section>

      <section className="w-full border-b bg-background">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
              Decisions stored in graph.json
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              We read these from graph.json. We do not re-decide them in a prompt.
            </p>
          </div>
          <Tabs defaultValue={INTENT_IDS[0]} className="mt-10 gap-8">
            <TabsList variant="line" className="h-auto w-full justify-start gap-6">
              {decisions.map((d) => (
                <TabsTrigger key={d.id} value={d.id} className="flex-none px-0 py-2">
                  {d.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {decisions.map((d) => (
              <TabsContent key={d.id} value={d.id} className="mt-0">
                <p className="text-sm text-muted-foreground">
                  <code>{d.node}</code>
                </p>
                <h3 className="mt-3 text-3xl font-bold tracking-tight text-balance md:text-4xl">
                  Use {d.use}
                </h3>
                {d.parts.length > 0 ? (
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {d.parts.map((part) => (
                      <li key={part}>
                        <Badge variant="secondary">{part}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-6 text-muted-foreground">
                    No preferred_composition edges on this node in graph.json.
                  </p>
                )}
                <p className="mt-6 max-w-xl text-sm text-muted-foreground text-pretty">
                  Keep the structure. Swap the content.
                </p>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <section className="w-full border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-4xl">
            How to run a decision
          </h2>
          <ol className="mt-10 max-w-2xl list-decimal space-y-4 pl-5 text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Intent.</span> Name the user
              goal (submit a form, present pricing, confirm a destructive action).
            </li>
            <li>
              <span className="font-medium text-foreground">Decide.</span>{' '}
              <Kbd>npm run graph:decide -- decide &lt;intent&gt;</Kbd> returns the preferred
              pattern, composition, mandatory rules and anti-patterns.
            </li>
            <li>
              <span className="font-medium text-foreground">Constraints.</span> Obey every
              MANDATORY rule; PREFERRED unless a higher-tier rule overrides.
            </li>
            <li>
              <span className="font-medium text-foreground">Impact.</span>{' '}
              <Kbd>npm run what-uses -- &lt;pkg or component&gt;</Kbd> lists what a change
              touches before you ship it.
            </li>
          </ol>
        </div>
      </section>

      <ClosingCta
        title="Try Origin"
        body="The engine is one part. The rest of the product is the brand and the components."
        href={LINKS.pricing.href}
        label={LINKS.pricing.label}
      />
    </main>
  )
}
