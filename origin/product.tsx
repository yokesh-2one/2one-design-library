import { ArrowRight, Boxes, FileJson, Palette, Puzzle, ShieldCheck, Workflow } from 'lucide-react'

import { PRODUCT_PARTS } from './content'
import { Audiences } from './audiences'
import { ClosingCta } from './closing-cta'
import { Differentiators } from './differentiators'
import { HowItWorks } from './how-it-works'
import { OriginAndServices } from './origin-and-services'
import { PageCrumb } from './page-crumb'
import { LINKS } from './nav'
import { PageHero } from './page-hero'
import { formatScore, scoreById } from './scores'
import { SiteFaq } from './site-faq'
import { Versus } from './versus'

export function ProductPage() {
  const ui = scoreById('components_ui')
  const authored = scoreById('components_2one')
  const charts = scoreById('charts')
  const layers = [
    {
      icon: Boxes,
      title: 'Components',
      file: 'src/components/',
      items: [
        ui && authored
          ? `${formatScore(ui)} shadcn/ui primitives plus ${formatScore(authored)} 2one-authored files`
          : 'shadcn/ui primitives plus 2one-authored files. Live count in metrics/snapshot.json',
        'Import from the package. Do not copy source',
        'Pill buttons. lucide icons only',
      ],
    },
  {
    icon: Puzzle,
    title: 'Templates and patterns',
    file: 'src/blocks/ · src/patterns/',
    items: [
      'Auth and dashboard blocks',
      charts
        ? `Marketing sections and ${formatScore(charts)} chart blocks`
        : 'Marketing sections and chart blocks',
      'Page patterns: pricing-page and app-shell',
    ],
  },
  {
    icon: Palette,
    title: 'Tokens and brand files',
    file: 'tokens/*.json · brand/brand.json',
    items: [
      'Colour, type, and spacing',
      'One brand accent (--brand) for links, focus, and selection',
      'Voice, personas, and mission in brand.json',
      'Photography and illustration are absent',
    ],
  },
  {
    icon: Workflow,
    title: 'Knowledge graph',
    file: 'graph.json',
    items: [
      'Intents, preferences, and anti-patterns in graph.json',
      'npm run graph:decide names the pattern for an intent',
      'npm run what-uses lists what a package or component touches',
    ],
  },
  {
    icon: FileJson,
    title: 'AI-legibility layer',
    file: 'manifest.json · llms.txt · AGENTS.md',
    items: [
      'instructions_for_ai: cite a file, never invent a brand fact',
      'llms.txt over HTTPS, no clone required',
      'CLAUDE.md, GEMINI.md, .cursorrules, and copilot-instructions.md generate from the same source',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Rules and verify',
    file: 'rules/ux-rules.json · npm run verify',
    items: [
      'UX rules with severity and precedence, including web-writing',
      'Rule lifecycle: a rule cannot change in silence',
      'npx 2one check for consumers; npm run a11y for contrast',
      'Playwright visual and axe suite; scorecard in docs/visual-coverage.md',
    ],
  },
  ]

  return (
    <main>
      <PageCrumb current="Origin" />
      <PageHero
        eyebrow="Product"
        title="One brand. Product and marketing. Not two guesses."
        body={
          <p>
            Origin holds the company’s look and the rules for using it. AI and
            the team build from that, instead of inventing a screen. Today the
            MVP is this repository. Commands and file names are further down,
            for people who install it.
          </p>
        }
        primary={{ href: LINKS.pricing.href, label: LINKS.pricing.label, icon: <ArrowRight /> }}
        secondary={{ href: LINKS.graph.href, label: LINKS.graph.label }}
      >
        <div className="flex flex-col gap-8">
          {PRODUCT_PARTS.map(({ title, desc }) => (
            <div key={title} className="flex flex-col gap-2">
              <p className="text-lg font-semibold tracking-tight">{title}</p>
              <p className="text-sm text-muted-foreground text-pretty">{desc}</p>
            </div>
          ))}
        </div>
      </PageHero>

      <Differentiators />
      <Audiences />
      <HowItWorks />
      <Versus />

      <section className="w-full border-b bg-background">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-4xl">
            If you install it
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
            For developers. Paths and commands. Skip this if you are reading for
            design or product.
          </p>
          <ol className="mt-14 grid gap-10 border-t pt-10 md:grid-cols-2">
            {layers.map((layer, i) => (
              <li key={layer.title} className="flex flex-col gap-3">
                <p className="text-sm tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                  <layer.icon className="size-5 text-muted-foreground" aria-hidden />
                  {layer.title}
                </h3>
                <p>
                  <code className="text-sm">{layer.file}</code>
                </p>
                <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                  {layer.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <OriginAndServices />

      <SiteFaq
        heading="Product questions"
        items={[
          {
            q: 'Is this a Figma replacement?',
            a: 'No. It does not draw. It holds the brand and rules so AI can build product and marketing on brand.',
          },
          {
            q: 'Is this only for developers?',
            a: 'No. Designers own the data. PMs own the questions. Developers install and check. Marketing uses the same brand.',
          },
          {
            q: 'Is Origin only a knowledge engine?',
            a: 'No. You still need the components and brand files. The engine is how Origin keeps two people from getting two screens. How AI is briefed, and how a check fails drift, is under If you install it.',
          },
          {
            q: 'Where is the visual scorecard?',
            a: 'docs/visual-coverage.md. It is generated from committed baselines. Link in the footer System column as visual coverage scorecard.',
          },
        ]}
      />

      <ClosingCta
        title="See if this is your problem"
        body="Start free on 2one’s brand. Put yours in on Customise. Call 2one when you want a partner as well as a seat."
        href={LINKS.contact.href}
        label={LINKS.contact.label}
      />
    </main>
  )
}
