import { Check, Minus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { ClosingCta } from './closing-cta'
import { GraphSnapshot } from './graph-snapshot'
import { LINKS } from './nav'
import { PageCrumb } from './page-crumb'
import { PageHero } from './page-hero'
import { formatScore, scoreById } from './scores'
import { SiteFaq } from './site-faq'

function fullComponentSetLine() {
  const s = scoreById('components_total')
  return s ? `Full ${formatScore(s)}-component set, 2one tokens` : 'Full component set, 2one tokens'
}

const PLANS = [
  {
    name: 'Free',
    recommended: false,
    price: '$0',
    cadence: 'out of the box',
    desc: 'The library as shipped. No customisation.',
    features: [
      fullComponentSetLine(),
      'Light + audited dark',
      'Knowledge graph as published (2one values)',
      'Community use of the repo',
    ],
    cta: 'Clone the repo',
    href: LINKS.repo.href,
    primary: false,
  },
  {
    name: 'Customise',
    recommended: true,
    price: '$30',
    cadence: 'per user / month',
    desc: 'Encode your mission and values into the graph.',
    features: [
      'Everything in Free',
      'Your tokens, voice, and logo rules',
      'Graph opinions for your company',
      'Page patterns + impact analysis',
    ],
    cta: 'Start Customise',
    href: LINKS.contact.href,
    primary: true,
  },
  {
    name: 'Enterprise',
    recommended: false,
    price: '$20',
    cadence: 'per user / month, 100+ seats',
    desc: 'Volume pricing when the whole org builds on Origin.',
    features: [
      'Everything in Customise',
      'Onboarding for 100+ users',
      'Dedicated design review',
      'Named contact at 2one',
    ],
    cta: 'Contact sales',
    href: LINKS.contact.href,
    primary: false,
  },
]

// 2one-allow: Origin list prices are commercial terms, not facts in graph.json.
const COMPARISON: { label: string; values: (boolean | string)[] }[] = [
  { label: 'Components & tokens as shipped', values: [true, true, true] },
  { label: 'Light + audited dark', values: [true, true, true] },
  { label: 'Customise tokens, voice, logo', values: [false, true, true] },
  { label: 'Company values in the knowledge graph', values: [false, true, true] },
  { label: 'Volume price at 100+ users', values: [false, false, true] },
  { label: 'Support', values: ['Community', 'Priority', 'Named + review'] },
]

function Cell({ v }: { v: boolean | string }) {
  if (typeof v === 'string') return <span className="text-sm">{v}</span>
  return v ? (
    <>
      <Check className="mx-auto size-4 text-foreground" aria-hidden />
      <span className="sr-only">Included</span>
    </>
  ) : (
    <>
      <Minus className="mx-auto size-4 text-muted-foreground" aria-hidden />
      <span className="sr-only">Not included</span>
    </>
  )
}

export function PricingPageView() {
  return (
    <main>
      <PageCrumb current="Pricing" />
      <PageHero
        eyebrow="Origin"
        title="Origin plans and prices"
        body={
          <>
            <p>
              You are buying a place for the brand so the next screen does not
              start from a guess. Free is $0. Customise is $30 per user per month.
              Enterprise is $20 per user per month at 100 or more seats. Not a
              drawing tool.
            </p>
            <p className="mt-4">
              We haven’t published an annual rate. You can’t check out in this
              repository.
            </p>
          </>
        }
        secondary={{ href: LINKS.product.href, label: LINKS.product.label }}
      >
        <GraphSnapshot />
      </PageHero>

      <section aria-labelledby="pricing-heading" className="w-full border-b">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <h2 id="pricing-heading" className="sr-only">
            Origin plans
          </h2>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {PLANS.map((p) => (
              <Card key={p.name} className={p.recommended ? 'flex flex-col border-foreground shadow-md' : 'flex flex-col'}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>{p.name}</CardTitle>
                    {p.recommended && <Badge>Recommended</Badge>}
                  </div>
                  <CardDescription>{p.desc}</CardDescription>
                  <div className="flex flex-wrap items-baseline gap-1 pt-2">
                    <span className="text-4xl font-bold tracking-tight tabular-nums">{p.price}</span>
                    <span className="text-sm text-muted-foreground">{p.cadence}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="flex flex-col gap-3 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant={p.primary ? 'default' : 'outline'} asChild>
                    <a href={p.href}>{p.cta}</a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="compare-heading" className="w-full border-b">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
          <h2 id="compare-heading" className="text-center text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Compare plans
          </h2>
          <div className="mt-10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Feature</TableHead>
                  {PLANS.map((p) => (
                    <TableHead key={p.name} className="text-center">
                      {p.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {COMPARISON.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    {row.values.map((v, i) => (
                      <TableCell key={i} className="text-center">
                        <Cell v={v} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      <SiteFaq
        heading="Pricing questions"
        items={[
          {
            q: 'What does “no customisation” on Free mean?',
            a: 'You get 2one tokens, 2one wordmark rules, and the published graph. You can build with that. You can’t re-skin the system or rewrite the opinions without Customise.',
          },
          {
            q: 'Is there an annual discount?',
            a: 'No. We haven’t published one. Monthly per user: $0, $30, and $20 at 100+ seats.',
          },
          {
            q: 'Is billing live in this repository?',
            a: 'No. There’s no checkout in the library. Write to 2one for Customise or Enterprise.',
          },
        ]}
      />

      <ClosingCta
        title="Talk about Customise or Enterprise"
        body="Tell us the seat count. We’ll map Customise vs Enterprise. We won’t invent features."
        href={LINKS.contact.href}
        label={LINKS.contact.label}
      />
    </main>
  )
}
