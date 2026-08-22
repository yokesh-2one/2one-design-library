import { useEffect, useState } from 'react'
import {
  Sun, Moon, ArrowLeft, ArrowUp, ArrowDown,
  // Tier 1 — brand modules
  Target, Gem, Drama, Users, Crown, Tag,
  // Tier 2 — design foundation
  Palette, Type, Shapes, Brush, Camera, LayoutGrid, MessageSquareQuote, Images,
  // Tier 3 — output
  Monitor, Megaphone, FileText,
  // guiding principle
  UserRound, Bot,
} from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader,
  SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger,
} from '@/components/ui/sidebar'
import { Logo } from '@/components/logo'

/* ---------------------------------------------------------
   Content — condensed from the DLS definitions doc. Three
   tiers: strategic intent → building blocks → shipped output.
   Written in a professional, client-facing register for
   stakeholders who do not work in design day to day.
   --------------------------------------------------------- */

const NAV = [
  { grp: '', items: [['overview', 'What is a DLS?'], ['glance', 'The three tiers'], ['analogy', 'A working analogy']] },
  { grp: 'The three tiers', items: [['tier1', 'Tier 1 · Brand'], ['tier2', 'Tier 2 · Foundation'], ['tier3', 'Tier 3 · Output']] },
  { grp: 'More', items: [['principle', 'The guiding principle'], ['inrepo', 'Where it lives here']] },
  { grp: 'Explore', items: [['/', 'Catalog']] as [string, string][], },
] as { grp: string; items: [string, string][] }[]

// wire up the second Explore link separately (two external links)
const EXPLORE_LINKS: [string, string][] = [['/', 'Component catalog'], ['/graph.html', 'Knowledge graph']]

const TIER1_MODULES: [React.ReactNode, string, string][] = [
  [<Target />, 'Mission & Vision', 'The brand’s purpose today and its long-term aspiration — the reference point for every downstream decision.'],
  [<Gem />, 'Values', 'The core principles that guide how the brand behaves and makes decisions.'],
  [<Drama />, 'Personality', 'The brand’s human character — for example bold, precise, or approachable — which informs tone and visuals.'],
  [<Users />, 'Audiences & Personas', 'The defined segments the brand designs for, including their needs, behaviours, and context.'],
  [<Crown />, 'Archetype', 'The brand’s narrative role — Hero, Sage, Creator, and so on — used to keep its character consistent.'],
  [<Tag />, 'Tagline', 'A short, memorable line that captures the brand’s promise.'],
]

const TIER2_FOUNDATIONS: [React.ReactNode, string, string, string[]][] = [
  [<Palette />, 'Colours', 'The full colour system and the rules for using it — including accessibility.',
    ['Brand palette', 'Gradients', 'Neutral ramp', 'Semantic (success / error)', 'Contrast pairs', 'Usage do’s & don’ts']],
  [<Type />, 'Typography', 'The type system — hierarchy, legibility and the voice of text.',
    ['Brand typefaces', 'System fallbacks', 'Type scale (Display → Caption)', 'Weights & styles', 'Line-height & spacing', 'Script support']],
  [<Shapes />, 'Iconography', 'A consistent icon system across product and marketing.',
    ['Icon style', 'Base grid (e.g. 24×24)', 'Stroke weight', 'Categories', 'Size scale', 'Animated variants']],
  [<Brush />, 'Illustration', 'Rules for custom illustrated artwork.',
    ['Style guide', 'Illustration palette', 'People & inclusivity', 'Composition rules', 'Use-case library']],
  [<Camera />, 'Photography', 'Rules for real (non-illustrated) imagery.',
    ['Mood & style', 'Colour grading', 'Image treatment', 'Stock vs. custom']],
  [<LayoutGrid />, 'Graphics & Patterns', 'Supporting textures and decorative systems.',
    ['Background patterns', 'Data-viz style', 'Iconographic patterns', 'Surface effects']],
  [<MessageSquareQuote />, 'Voice & Tone', 'How the brand sounds — the language equivalent of the visuals.',
    ['Voice principles', 'Tone by context', 'Vocabulary do’s & don’ts', 'Writing examples', 'Localisation']],
  [<Images />, 'Moodboard', 'Reference material that anchors abstract style in concrete examples.',
    ['Inspiration boards', 'Aspirational references', 'Look-and-feel keywords', 'Texture & lighting refs']],
]

const TIER3_OUTPUTS: [React.ReactNode, string, string, string[]][] = [
  [<Monitor />, 'Product & Software', 'Digital interfaces where the system becomes functional UI.',
    ['Website', 'Web app / dashboards', 'Mobile app', 'Wearables', 'AR / VR']],
  [<Megaphone />, 'Marketing', 'Outward-facing materials for growth and engagement.',
    ['Social media', 'Motion / video', 'Ad formats', 'Pitch & sales decks']],
  [<FileText />, 'Comms & Internal', 'Internal and business-facing communication.',
    ['Internal decks', 'Reports & analytics', 'Stationery', 'Letterhead & signatures']],
]

function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const isDark = mounted && resolvedTheme === 'dark'
  return (
    <Button variant="outline" size="sm" className={className}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}>
      {isDark ? <Sun /> : <Moon />}{isDark ? 'Light' : 'Dark'}
    </Button>
  )
}

/* The pyramid: strategic intent at the apex, shipped output at the base.
   Fills are the grayscale --tier-N tokens (dls.css), so it recolors with
   the theme. Labels sit inside each band in its own contrasting ink. */
function TierPyramid() {
  return (
    <svg className="dls-pyramid" viewBox="0 0 480 320" role="img"
      aria-label="A three-tier pyramid: Tier 1 Brand at the top, Tier 2 Design Foundation in the middle, Tier 3 Design System at the base.">
      {/* Tier 3 — base (widest) */}
      <polygon points="120.4,206 359.6,206 420,300 60,300" fill="var(--tier-3)" stroke="var(--border)" />
      <text x="240" y="252" textAnchor="middle" fill="var(--tier-3-ink)">
        <tspan className="t-tag" fontSize="10" fill="var(--muted-foreground)">TIER 3 · WHERE</tspan>
        <tspan className="t-title" x="240" dy="20" fontSize="16">Design System</tspan>
      </text>
      {/* Tier 2 — middle */}
      <polygon points="180.2,113 299.8,113 355.7,200 124.3,200" fill="var(--tier-2)" />
      <text x="240" y="150" textAnchor="middle" fill="var(--tier-2-ink)">
        <tspan className="t-tag" fontSize="9" opacity="0.85">TIER 2 · WHAT</tspan>
        <tspan className="t-title" x="240" dy="18" fontSize="15">Design Foundation</tspan>
      </text>
      {/* Tier 1 — apex (narrowest) */}
      <polygon points="240,20 295.9,107 184.1,107" fill="var(--tier-1)" />
      <text x="240" y="72" textAnchor="middle" fill="var(--tier-1-ink)">
        <tspan className="t-tag" fontSize="8" opacity="0.75">TIER 1</tspan>
        <tspan className="t-title" x="240" dy="15" fontSize="14">Brand</tspan>
      </text>
    </svg>
  )
}

const ROWS: [string, string, string, string][] = [
  ['Tier 1', 'Brand foundation', 'var(--tier-1)', 'Defines why the brand exists and who it serves. This tier is pure strategy and contains no visual rules; everything below must trace back to it.'],
  ['Tier 2', 'Design foundation', 'var(--tier-2)', 'The reusable building blocks — colour, typography, iconography, and voice. This is the brand’s vocabulary; no element here is a finished deliverable.'],
  ['Tier 3', 'Design system', 'var(--tier-3)', 'The building blocks assembled into finished, shippable work — applications, websites, decks, and campaigns. This is what customers ultimately see.'],
]

function ModuleCard({ icon, title, desc, subs }: { icon: React.ReactNode; title: string; desc: string; subs?: string[] }) {
  return (
    <Card className="gap-3">
      <CardHeader>
        <div className="dls-ico" aria-hidden>{icon}</div>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      {subs && (
        <CardContent>
          <div className="flex flex-wrap gap-2">{subs.map((s) => <Badge key={s} variant="outline" className="font-normal">{s}</Badge>)}</div>
        </CardContent>
      )}
    </Card>
  )
}

export function Dls() {
  const [active, setActive] = useState('overview')
  useEffect(() => {
    const secs = Array.from(document.querySelectorAll('.g-section[id]'))
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    secs.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <Logo variant="black" width={52} className="dark:hidden" />
            <Logo variant="white" width={52} className="hidden dark:block" />
            <span className="text-xs leading-tight text-muted-foreground">design language<br />system</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {NAV.map((g, i) => (
            <SidebarGroup key={i}>
              {g.grp && <SidebarGroupLabel>{g.grp}</SidebarGroupLabel>}
              <SidebarMenu>
                {(g.grp === 'Explore' ? EXPLORE_LINKS : g.items).map(([id, label]) => (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton asChild isActive={active === id}>
                      <a href={id.startsWith('/') ? id : `#${id}`}>{label}</a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-1 !h-5" />
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <a href="/"><ArrowLeft className="size-4" /> Catalog</a>
          </Button>
          <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
            <b className="font-semibold text-foreground">what is a design language system?</b>
          </span>
          <ThemeToggle className="ml-auto" />
        </header>

        <div className="mx-auto w-full min-w-0 max-w-6xl px-6 pb-32 lg:px-10">

          {/* OVERVIEW / HERO */}
          <section id="overview" className="g-section g-hero">
            <div className="g-eyebrow">2one · design language system</div>
            <h1>The design language system, <span className="thin">explained.</span></h1>
            <p>
              A <b className="text-foreground">Design Language System (DLS)</b> is the complete set of rules, assets, and
              principles that define how a brand <em>looks</em>, <em>sounds</em>, and <em>behaves</em> across every surface —
              from a mission statement to a product icon. It is organised into three tiers that move from <b className="text-foreground">strategic
              intent</b> down to the <b className="text-foreground">finished work a customer sees</b>.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {([
                ['Why & who', 'Tier 1 — Brand', 'Strategy and positioning.'],
                ['What', 'Tier 2 — Foundation', 'Reusable building blocks.'],
                ['Where', 'Tier 3 — Output', 'Shipped products and assets.'],
              ] as const).map(([tag, title, sub]) => (
                <Card key={title}>
                  <CardHeader>
                    <CardDescription className="font-mono text-[11px] uppercase tracking-widest">{tag}</CardDescription>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription>{sub}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          {/* THE THREE TIERS — pyramid + rows */}
          <section id="glance" className="g-section">
            <div className="g-eyebrow">The model</div><h2>The three tiers, at a glance</h2>
            <p className="g-lede">The tiers can be read in either direction. Intent defined at the apex cascades <b>down</b> into everything the brand produces, and every finished asset at the base traces back <b>up</b> to the strategy that shaped it.</p>
            <div className="dls-glance">
              <div>
                <TierPyramid />
                <div className="mt-3 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><ArrowDown className="size-3.5" /> intent cascades down</span>
                  <span className="flex items-center gap-1.5"><ArrowUp className="size-3.5" /> output traces up</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {ROWS.map(([tier, name, color, desc]) => (
                  <Card key={tier}>
                    <CardHeader className="flex-row items-stretch gap-3 space-y-0">
                      <span className="w-1.5 shrink-0 self-stretch rounded-full" style={{ background: color }} aria-hidden />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{tier}</span>
                          <CardTitle className="text-base">{name}</CardTitle>
                        </div>
                        <CardDescription className="mt-1">{desc}</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* ANALOGY */}
          <section id="analogy" className="g-section">
            <div className="g-eyebrow">For non-design stakeholders</div><h2>A working analogy: language</h2>
            <p className="g-lede">The name is deliberate. A design <em>language</em> behaves much like a spoken one, and the three tiers map directly onto its structure.</p>
            <div className="dls-grid three">
              <Card className="gap-2">
                <CardHeader>
                  <Badge variant="outline" className="w-fit">Tier 1</Badge>
                  <CardTitle className="text-base">The intent behind speaking</CardTitle>
                  <CardDescription>Who you are addressing and what you mean to convey. This is the <b className="text-foreground">brand</b>: mission, values, personality, and audience.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="gap-2">
                <CardHeader>
                  <Badge variant="outline" className="w-fit">Tier 2</Badge>
                  <CardTitle className="text-base">Vocabulary and grammar</CardTitle>
                  <CardDescription>The words and rules you assemble sentences from. This is the <b className="text-foreground">design foundation</b>: colour, typography, iconography, and tone of voice — reusable, never a finished sentence on their own.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="gap-2">
                <CardHeader>
                  <Badge variant="outline" className="w-fit">Tier 3</Badge>
                  <CardTitle className="text-base">The conversations themselves</CardTitle>
                  <CardDescription>The sentences you actually say. This is the <b className="text-foreground">design system in use</b>: the product screens, websites, campaigns, and decks that customers experience.</CardDescription>
                </CardHeader>
              </Card>
            </div>
            <Card className="mt-4">
              <CardContent className="flex items-start gap-3 pt-6 text-sm text-muted-foreground">
                <span className="dls-ico" aria-hidden><FileText /></span>
                <p className="m-0">
                  An alternative analogy is construction. <b className="text-foreground">Tier 1</b> is the project brief — what is being built and for whom;
                  <b className="text-foreground"> Tier 2</b> is the materials and the building code; and <b className="text-foreground">Tier 3</b> is the finished, occupied building.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* TIER 1 */}
          <section id="tier1" className="g-section">
            <div className="g-eyebrow flex items-center gap-2">
              <span className="inline-block size-3 rounded-full" style={{ background: 'var(--tier-1)' }} /> Tier 1 · the apex
            </div>
            <h2>Brand foundation — the “why” and “who”</h2>
            <p className="g-lede">The strategic core of the system. This tier contains <b>no visual rules</b>; it defines why the brand exists and who it serves. Every decision in the tiers below must trace back to it.</p>
            <div className="dls-grid">
              {TIER1_MODULES.map(([icon, title, desc]) => (
                <ModuleCard key={title} icon={icon} title={title} desc={desc} />
              ))}
            </div>
          </section>

          {/* TIER 2 */}
          <section id="tier2" className="g-section">
            <div className="g-eyebrow flex items-center gap-2">
              <span className="inline-block size-3 rounded-full" style={{ background: 'var(--tier-2)' }} /> Tier 2 · the middle
            </div>
            <h2>Design foundation — the building blocks</h2>
            <p className="g-lede">The reusable building blocks and rules derived from Tier 1 — the brand’s vocabulary. No element in this tier is a finished deliverable; each is a rule or component that Tier 3 assembles into shipped work.</p>
            <div className="dls-grid two">
              {TIER2_FOUNDATIONS.map(([icon, title, desc, subs]) => (
                <ModuleCard key={title} icon={icon} title={title} desc={desc} subs={subs} />
              ))}
            </div>
          </section>

          {/* TIER 3 */}
          <section id="tier3" className="g-section">
            <div className="g-eyebrow flex items-center gap-2">
              <span className="inline-block size-3 rounded-full border" style={{ background: 'var(--tier-3)' }} /> Tier 3 · the base
            </div>
            <h2>Design system — the shipped output</h2>
            <p className="g-lede">The applied layer, where the Tier 2 foundations are assembled into finished, shippable deliverables — organised by where they are used.</p>
            <div className="dls-grid three">
              {TIER3_OUTPUTS.map(([icon, title, desc, subs]) => (
                <ModuleCard key={title} icon={icon} title={title} desc={desc} subs={subs} />
              ))}
            </div>
          </section>

          {/* GUIDING PRINCIPLE */}
          <section id="principle" className="g-section">
            <div className="g-eyebrow">The guiding principle</div><h2>Human-understandable and AI-legible</h2>
            <p className="g-lede">A well-built DLS is documented clearly enough for a person to apply by hand, and structured precisely enough for an AI system to parse and build from without ambiguity.</p>
            <div className="dls-grid two">
              <Card>
                <CardHeader>
                  <div className="dls-ico" aria-hidden><UserRound /></div>
                  <CardTitle className="text-base">A person can apply it</CardTitle>
                  <CardDescription>Every rule, token, and asset is documented in plain language, so a new team member can produce on-brand work without a designer present.</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="dls-ico" aria-hidden><Bot /></div>
                  <CardTitle className="text-base">An AI can build from it</CardTitle>
                  <CardDescription>Every element is labelled and structured, so an AI assistant can read the system and generate on-brand work directly — without inventing colours, fonts, or components.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>

          {/* WHERE IT LIVES IN THIS REPO */}
          <section id="inrepo" className="g-section">
            <div className="g-eyebrow">Applied to this library</div><h2>Where each tier lives in this library</h2>
            <p className="g-lede"><span className="mono">@yokesh-2one/design-library</span> implements this three-tier model directly. Each tier maps to specific files in the repository.</p>
            <div className="dls-map">
              <div className="dls-map-row">
                <div className="k">Tier 1 · Brand</div>
                <div className="v">
                  <p>Brand strategy — mission, values, personality, and voice — is defined in <code>brand/brand.json</code> and <code>brand/BRAND.md</code>.</p>
                  <div className="dls-subs"><span className="sub">brand/brand.json</span><span className="sub">brand/BRAND.md</span><span className="sub">brand/logo</span></div>
                </div>
              </div>
              <div className="dls-map-row">
                <div className="k">Tier 2 · Foundation</div>
                <div className="v">
                  <p>The building blocks — colour, typography, and spacing — are defined as tokens in <code>tokens/</code> and consumed by the components in <code>src/components/ui</code>.</p>
                  <div className="dls-subs"><span className="sub">tokens/colors.json</span><span className="sub">tokens/typography.json</span><span className="sub">tokens/spacing.json</span><span className="sub">src/components/ui</span></div>
                </div>
              </div>
              <div className="dls-map-row">
                <div className="k">Tier 3 · Output</div>
                <div className="v">
                  <p>The assembled, shippable pieces — pre-composed blocks, charts, and AI build recipes — live in <code>src/blocks</code> and <code>recipes/</code>.</p>
                  <div className="dls-subs"><span className="sub">src/blocks</span><span className="sub">recipes/build-an-app.md</span><span className="sub">recipes/build-a-website.md</span></div>
                </div>
              </div>
              <div className="dls-map-row">
                <div className="k">AI-legible layer</div>
                <div className="v">
                  <p>A machine-readable index ties the system together. An AI assistant reads these files first, then builds only from the system.</p>
                  <div className="dls-subs"><span className="sub">manifest.json</span><span className="sub">registry.json</span><span className="sub">graph.json</span></div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm"><a href="/">← Back to the component catalog</a></Button>
              <Button asChild variant="outline" size="sm"><a href="/graph.html">Open the knowledge graph →</a></Button>
            </div>
          </section>

          <footer className="mt-16 border-t pt-8 text-sm text-muted-foreground">
            @yokesh-2one/design-library · design language system reference · light and audited dark.
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
