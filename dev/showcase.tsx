import { useEffect, useState } from 'react'
import {
  Star, Bold, Italic, Underline, Search, Bell, Home, User, Rocket, CreditCard,
  LogOut, CircleAlert, Copy, Check, Sun, Moon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import graphData from '../graph.json'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Toaster } from '@/components/ui/sonner'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader,
  SidebarInset, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger,
} from '@/components/ui/sidebar'

import { Logo } from '@/components/logo'
import { AppBar } from '@/components/app-bar'
import { BottomNavItem } from '@/components/bottom-nav-item'

// blocks (templates)
import { LoginForm as Login01 } from '@/blocks/login-01'
import { LoginForm as Login03 } from '@/blocks/login-03'
import { SignupForm as Signup01 } from '@/blocks/signup-01'
import { DashboardPlain } from '@/blocks/dashboard-plain/page'
import { ChartAreaInteractive as ChartArea } from '@/blocks/charts/chart-area-interactive'
import { ChartBarMultiple } from '@/blocks/charts/chart-bar-multiple'
import { ChartLineMultiple } from '@/blocks/charts/chart-line-multiple'
import { ChartPieDonutText } from '@/blocks/charts/chart-pie-donut-text'
import { ChartRadarDefault } from '@/blocks/charts/chart-radar-default'
import { ChartRadialStacked } from '@/blocks/charts/chart-radial-stacked'

/* ---------- foundation data (from tokens/*.css) ---------- */
// Foundation swatches derive colour + label from the live @theme tokens
// (--color-<ramp>-<step> in tokens/colors.css), so this section can never
// drift from the real theme — change a token and the swatch follows.
const NEUTRAL = ['50', '100', '200', '250', '300', '400', '600', '700', '800', '950']
const ACCENT = ['50', '100', '200', '300', '600', '700', '800', '950']
const SEM = ['danger-500', 'danger-600', 'danger-700', 'success-600']
const TYPE: [string, string, string][] = [['display', 'text-display', '76 / 103'], ['h1', 'text-h1', '62 / 84'], ['h2', 'text-h2', '48 / 65'], ['h3', 'text-h3', '40 / 54'], ['h4', 'text-h4', '32 / 43'], ['h5', 'text-h5', '26 / 35'], ['h6', 'text-h6', '20 / 27'], ['base', 'text-base', '16 · body'], ['sm', 'text-sm', '14 · UI'], ['xs', 'text-xs', '12 · small']]
const RADII = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full']

// Component index derived from the knowledge graph (single source of truth — no
// hand-maintained list to drift). Each chip deep-links into /graph.html.
const GRAPH_COMPONENTS = (graphData.nodes as { id: string; type: string; label: string }[])
  .filter((n) => n.type === 'component' || n.type === 'component-2one')
  .map((n) => ({ id: n.id, label: n.label }))
  .sort((a, b) => a.label.localeCompare(b.label))

const NAV = [
  { grp: '', items: [['overview', 'Overview', ''], ['use', 'How to use', ''], ['playground', 'Theming', '']] },
  { grp: 'Foundations', items: [['color', 'Colour', ''], ['type', 'Typography', ''], ['radius', 'Radius', '']] },
  { grp: 'Components', items: [['actions', 'Actions', ''], ['forms', 'Forms', ''], ['overlays', 'Overlays', ''], ['data', 'Data display', ''], ['feedback', 'Feedback', ''], ['navigation', 'Navigation', ''], ['mobile', 'Mobile · 2one', '']] },
  { grp: 'Templates', items: [['blocks', 'Blocks', '9'], ['charts', 'Charts', '31']] },
  { grp: 'Reference', items: [['index', 'All components', '57']] },
  { grp: 'Explore', items: [['/graph.html', 'Knowledge graph', '198']] },
]


function CodeBlock({ code }: { code: string }) {
  const [done, setDone] = useState(false)
  return (
    <div className="relative min-w-0">
      <pre className="overflow-x-auto rounded-md bg-muted p-3 pr-11 font-mono text-sm text-muted-foreground">{code}</pre>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={done ? 'Copied' : 'Copy to clipboard'}
        className="absolute right-1.5 top-1.5"
        onClick={() => { navigator.clipboard?.writeText(code); setDone(true); setTimeout(() => setDone(false), 1200) }}
      >
        {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </Button>
    </div>
  )
}

function Block({ title, meta, className = '', children }: { title: string; meta?: string; className?: string; children: React.ReactNode }) {
  const col = className.includes('col')
  return (
    <Card className="min-w-0 gap-4">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {meta && <CardDescription>{meta}</CardDescription>}
      </CardHeader>
      <CardContent className={`flex min-w-0 flex-wrap gap-4 [&>*]:min-w-0 [&>*]:max-w-full ${col ? 'flex-col items-start' : 'items-center'}`}>
        {children}
      </CardContent>
    </Card>
  )
}
const Cap = ({ children }: { children: React.ReactNode }) => <span className="text-xs text-muted-foreground">{children}</span>

// Light/dark toggle — verifies the whole system in both themes (dogfoods ThemeProvider).
function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const isDark = mounted && resolvedTheme === 'dark'
  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun /> : <Moon />}
      {isDark ? 'Light' : 'Dark'}
    </Button>
  )
}

/* ---------- Theming playground: APCA ported from scripts/apca-audit.mjs ---------- */
function sRGBtoY(hex: string) {
  const h = hex.replace('#', ''); const R = parseInt(h.slice(0, 2), 16), G = parseInt(h.slice(2, 4), 16), B = parseInt(h.slice(4, 6), 16)
  const f = (v: number) => Math.pow(v / 255, 2.4); return 0.2126729 * f(R) + 0.7151522 * f(G) + 0.0721750 * f(B)
}
function apca(txt: string, bg: string) {
  let t = sRGBtoY(txt), b = sRGBtoY(bg)
  const bT = 0.022, bC = 1.414, dY = 0.0005, s = 1.14, lB = 0.027, lW = 0.027, lC = 0.1, nBG = 0.56, nT = 0.57, rT = 0.62, rB = 0.65
  t = t > bT ? t : t + Math.pow(bT - t, bC); b = b > bT ? b : b + Math.pow(bT - b, bC)
  if (Math.abs(b - t) < dY) return 0
  let C: number
  if (b > t) { const S = (Math.pow(b, nBG) - Math.pow(t, nT)) * s; C = S < lC ? 0 : S - lB }
  else { const S = (Math.pow(b, rB) - Math.pow(t, rT)) * s; C = S > -lC ? 0 : S + lW }
  return Math.round(C * 1000) / 10
}
// auto-pick the label colour with the strongest contrast — the "contrasting label" guidance
const bestFg = (bg: string) => (Math.abs(apca('#ffffff', bg)) >= Math.abs(apca('#09090b', bg)) ? '#ffffff' : '#09090b')
const PRESETS = ['#09090b', '#0057ff', '#15803d', '#7c3aed', '#db2777', '#ea580c']
const THEME_VARS = ['--primary', '--primary-foreground', '--sidebar-primary', '--sidebar-primary-foreground', '--ring']

function ThemingPlayground() {
  const [color, setColor] = useState('#09090b')
  useEffect(() => {
    const cur = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()
    if (/^#[0-9a-f]{6}$/i.test(cur)) setColor(cur)
  }, [])
  const apply = (c: string) => {
    setColor(c)
    const f = bestFg(c), r = document.documentElement.style
    r.setProperty('--primary', c); r.setProperty('--primary-foreground', f)
    r.setProperty('--sidebar-primary', c); r.setProperty('--sidebar-primary-foreground', f); r.setProperty('--ring', c)
  }
  const reset = () => {
    const r = document.documentElement.style
    THEME_VARS.forEach((p) => r.removeProperty(p))
    setColor(getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#09090b')
  }
  const fg = bestFg(color)
  const lc = Math.abs(apca(fg, color))
  const pass = lc >= 75
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Brand colour</CardTitle>
        <CardDescription>Set <span className="mono">--primary</span> and the whole system recolors — buttons, links, focus, nav.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <input type="color" aria-label="Pick brand colour" value={color} onChange={(e) => apply(e.target.value)}
            className="size-10 cursor-pointer rounded-md border bg-background p-0.5" />
          <span className="mono text-sm">{color}</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {PRESETS.map((p) => (
              <button key={p} aria-label={`Use ${p}`} onClick={() => apply(p)}
                className="size-6 rounded-full border" style={{ background: p }} />
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={reset} className="ml-auto">Reset</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {pass
            ? <Badge variant="secondary" className="gap-1.5"><Check className="size-3.5" /> APCA Lc {lc.toFixed(1)} · pass</Badge>
            : <Badge variant="destructive" className="gap-1.5"><CircleAlert className="size-3.5" /> APCA Lc {lc.toFixed(1)} · fail</Badge>}
          <span className="text-muted-foreground">{pass ? 'label clears the Lc 75 threshold for button text.' : 'label is unreadable on this colour — pick a darker/lighter hue.'}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-md border p-4">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Badge>Badge</Badge>
          <a href="#playground" className="text-primary underline underline-offset-2 text-sm">A themed link</a>
          <Input placeholder="Focus me" className="w-40" />
        </div>
      </CardContent>
    </Card>
  )
}

export function Showcase() {
  const [active, setActive] = useState('overview')

  useEffect(() => {
    const secs = Array.from(document.querySelectorAll('.g-section[id]'))
    const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) }), { rootMargin: '-45% 0px -50% 0px' })
    secs.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  return (
    <TooltipProvider delayDuration={200}>
      <SidebarProvider>
        {/* App shell — the library's own Sidebar, not bespoke chrome */}
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
                  {g.items.map(([id, label, n]) => (
                    <SidebarMenuItem key={id}>
                      <SidebarMenuButton asChild isActive={active === id}>
                        <a href={id.startsWith('/') ? id : `#${id}`}>{label}</a>
                      </SidebarMenuButton>
                      {n && <SidebarMenuBadge>{n}</SidebarMenuBadge>}
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
            <span className="font-mono text-xs text-muted-foreground">
              <b className="font-semibold text-foreground">@yokesh-2one/design-library</b> · shadcn · 2one-themed
            </span>
            <ThemeToggle className="ml-auto" />
          </header>
          <div className="mx-auto w-full min-w-0 max-w-7xl px-6 pb-32 lg:px-10">

            {/* OVERVIEW */}
            <section id="overview" className="g-section g-hero">
              <div className="g-eyebrow">2one · design language system</div>
              <h1>The 2one system, <span className="thin">built on shadcn/ui.</span></h1>
              <p>Every component on this page is the real <span className="mono">@yokesh-2one/design-library</span> — the shadcn/ui set re-skinned to the 2one tokens. Grayscale, light + dark, pill buttons, Satoshi headings, Inter body.</p>
              <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {([['57', 'Components'], ['54', 'shadcn primitives'], ['3', '2one-only'], ['1', 'Hue-free system']] as const).map(([k, l]) => (
                  <Card key={l}>
                    <CardHeader>
                      <CardDescription>{l}</CardDescription>
                      <CardTitle className="text-3xl font-semibold tabular-nums">{k}</CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Card className="min-w-0">
                  <CardHeader>
                    <CardTitle className="text-base">Run it locally</CardTitle>
                    <CardDescription>Works today — no registry, no auth.</CardDescription>
                  </CardHeader>
                  <CardContent className="min-w-0">
                    <CodeBlock code={'npm install\nnpm run dev'} />
                  </CardContent>
                </Card>
                <Card className="min-w-0">
                  <CardHeader>
                    <CardTitle className="text-base">Use in your app</CardTitle>
                    <CardDescription>React 19 · Tailwind v4.</CardDescription>
                  </CardHeader>
                  <CardContent className="min-w-0">
                    <CodeBlock code={"import { Button } from '@yokesh-2one/design-library'\nimport '@yokesh-2one/design-library/styles'"} />
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* HOW TO USE — composed from the 2one library (Card / Badge / Button), token-driven, grayscale */}
            <section id="use" className="g-section">
              <div className="g-eyebrow">Start here</div><h2>How to use — build with AI</h2>
              <p className="g-lede">Built to be read by AI. Point your assistant — Claude Code, Cursor, Copilot, Gemini — at the repo and say what you want. It builds from the real 2one components, colours and rules. No code required.</p>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Badge variant="outline">1</Badge> Point your AI at the library</CardTitle>
                    <CardDescription>One instruction sets the ground truth — read the manifest, then build only from here.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">Read manifest.json first, then build only from this library — don’t invent colours, fonts or components.</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="mr-1 text-xs text-muted-foreground">It reads</span>
                      <Badge variant="secondary">manifest.json</Badge>
                      <Badge variant="secondary">brand/brand.json</Badge>
                      <Badge variant="secondary">registry.json</Badge>
                    </div>
                    <Button asChild variant="outline" size="sm" className="w-fit">
                      <a href="https://github.com/yokesh-2one/2one-design-library" target="_blank" rel="noreferrer">Open the repo</a>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Badge variant="outline">2</Badge> Ask for what you want</CardTitle>
                    <CardDescription>Plain English. It composes real components, on brand.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">Build a login screen with email, password and a Continue button.</p>
                    <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">Write a pricing page. Use our voice from brand/brand.json and the real tokens.</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="mr-1 text-xs text-muted-foreground">Recipes</span>
                      <Badge variant="secondary">build-an-app</Badge>
                      <Badge variant="secondary">build-a-website</Badge>
                      <Badge variant="secondary">build-marketing</Badge>
                      <Badge variant="secondary">build-a-deck</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Badge variant="outline">3</Badge> Make it your colour</CardTitle>
                    <CardDescription>Grayscale by design — one variable carries the brand: the primary.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">In src/styles/globals.css set --primary to #0057FF and --primary-foreground to a contrasting label. Keep danger and success. Then run npm run a11y.</p>
                    <p className="text-sm text-muted-foreground">Everything updates at once. <span className="font-medium text-foreground">npm run a11y</span> proves it stays readable — and fails if it doesn’t.</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Badge variant="outline">4</Badge> Stay on brand</CardTitle>
                    <CardDescription>The system holds the line so you don’t have to.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="mr-1 text-xs text-muted-foreground">Truth lives in</span>
                      <Badge variant="secondary">brand/brand.json</Badge>
                      <Badge variant="secondary">tokens/*.json</Badge>
                      <Badge variant="secondary">src/components/ui</Badge>
                    </div>
                    <p className="rounded-md border border-border p-3 text-sm"><span className="font-medium">One hard rule:</span> never signal state by colour alone — an error needs an icon or text, not just red.</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* THEMING PLAYGROUND */}
            <section id="playground" className="g-section">
              <div className="g-eyebrow">Live</div><h2>Theming playground</h2>
              <p className="g-lede">Try your company colour. One variable carries the brand, so the whole system recolors at once — and the APCA check runs live so you never ship an unreadable button. This is exactly the change an AI makes when you say “make it our colour”.</p>
              <div className="mt-6"><ThemingPlayground /></div>
            </section>

            {/* COLOUR */}
            <section id="color" className="g-section">
              <div className="g-eyebrow">Foundations</div><h2>Colour</h2>
              <p className="g-lede">Grayscale by design — no brand hue. <b>danger</b> and <b>success</b> are the only colours, reserved for validation.</p>
              {/* Safelist: Tailwind v4 tree-shakes @theme vars no utility references.
                  The swatches read var(--color-<ramp>-<step>) at runtime, so we force
                  those vars into :root by naming every ramp utility here (literal names
                  only — Tailwind can't see interpolated class names). Kept hidden. */}
              <div className="hidden bg-neutral-50 bg-neutral-100 bg-neutral-200 bg-neutral-250 bg-neutral-300 bg-neutral-400 bg-neutral-600 bg-neutral-700 bg-neutral-800 bg-neutral-950 bg-accent-50 bg-accent-100 bg-accent-200 bg-accent-300 bg-accent-600 bg-accent-700 bg-accent-800 bg-accent-950 bg-danger-500 bg-danger-600 bg-danger-700 bg-success-600" aria-hidden />
              <div className="g-scale-label">neutral</div>
              <Swatches items={NEUTRAL} prefix="neutral-" />
              <div className="g-scale-label">accent</div>
              <Swatches items={ACCENT} prefix="accent-" />
              <div className="g-scale-label">semantic</div>
              <Swatches items={SEM} prefix="" />
            </section>

            {/* TYPE */}
            <section id="type" className="g-section">
              <div className="g-eyebrow">Foundations</div><h2>Typography</h2>
              <p className="g-lede"><b>Satoshi</b> for the heading scale, <b>Inter</b> for body &amp; UI. The scale below renders from the real tokens.</p>
              <div className="mt-4">
                {TYPE.map(([k, cls, spec]) => (
                  <div className="g-type-row" key={k}>
                    <div className="spec">--text-{k}<br />{spec}</div>
                    <div className={`demo ${cls} ${['display', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(k) ? 'font-heading font-bold' : ''}`}>Two one</div>
                  </div>
                ))}
              </div>
            </section>

            {/* RADIUS */}
            <section id="radius" className="g-section">
              <div className="g-eyebrow">Foundations</div><h2>Radius</h2>
              <p className="g-lede">From hairline chips to fully-round pills. Buttons use <span className="mono">full</span> — the 2one signature.</p>
              <div className="g-radii">
                {RADII.map((r) => <div className="g-rd" key={r} style={{ borderRadius: `var(--radius-${r})` }}>{r}</div>)}
              </div>
            </section>

            {/* ACTIONS */}
            <section id="actions" className="g-section">
              <div className="g-eyebrow">Components</div><h2>Actions</h2>
              <p className="g-lede">Buttons are pills; one primary per view.</p>
              <Block title="Button" meta="variant × size">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Delete</Button>
                <Button disabled>Disabled</Button>
                <Button size="sm">Small</Button>
                <Button size="lg"><Rocket /> Large</Button>
              </Block>
              <div className="g-grid2">
                <Block title="ButtonGroup">
                  <ButtonGroup>
                    <Button variant="outline">Day</Button>
                    <Button variant="outline">Week</Button>
                    <Button variant="outline">Month</Button>
                  </ButtonGroup>
                </Block>
                <Block title="Toggle · ToggleGroup">
                  <Toggle aria-label="Star"><Star /></Toggle>
                  <ToggleGroup type="multiple" variant="outline">
                    <ToggleGroupItem value="b" aria-label="Bold"><Bold /></ToggleGroupItem>
                    <ToggleGroupItem value="i" aria-label="Italic"><Italic /></ToggleGroupItem>
                    <ToggleGroupItem value="u" aria-label="Underline"><Underline /></ToggleGroupItem>
                  </ToggleGroup>
                </Block>
              </div>
            </section>

            {/* FORMS */}
            <section id="forms" className="g-section">
              <div className="g-eyebrow">Components</div><h2>Forms</h2>
              <div className="g-grid2">
                <Block title="Input · Label" className="col">
                  <div className="grid w-full max-w-sm gap-1.5"><Label htmlFor="em">Email</Label><Input id="em" placeholder="you@example.com" /></div>
                  <div className="grid w-full max-w-sm gap-1.5">
                    <Label htmlFor="pw">Password</Label>
                    <Input id="pw" type="password" aria-invalid defaultValue="123" aria-describedby="pw-err" />
                    <p id="pw-err" className="flex items-center gap-1.5 text-sm text-destructive"><CircleAlert className="size-4" /> Must be at least 8 characters.</p>
                  </div>
                </Block>
                <Block title="Textarea" className="col">
                  <Textarea placeholder="Write a message…" className="w-full" />
                </Block>
                <Block title="Checkbox · Radio · Switch" className="col">
                  <label className="flex items-center gap-2 text-sm"><Checkbox defaultChecked /> Remember me</label>
                  <label className="flex items-center gap-2 text-sm"><Checkbox /> Subscribe</label>
                  <RadioGroup defaultValue="std" className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="std" /> Standard</label>
                    <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="exp" /> Express</label>
                  </RadioGroup>
                  <label className="flex items-center gap-2 text-sm"><Switch defaultChecked /> Wi-Fi</label>
                </Block>
                <Block title="Select" className="col">
                  <Select><SelectTrigger className="w-52"><SelectValue placeholder="Country" /></SelectTrigger>
                    <SelectContent><SelectItem value="in">India</SelectItem><SelectItem value="us">United States</SelectItem><SelectItem value="de">Germany</SelectItem></SelectContent>
                  </Select>
                </Block>
                <Block title="Slider" className="col"><Slider defaultValue={[40]} max={100} step={1} className="w-64" /></Block>
                <Block title="InputOTP" className="col"><OtpDemo /></Block>
              </div>
            </section>

            {/* OVERLAYS */}
            <section id="overlays" className="g-section">
              <div className="g-eyebrow">Components</div><h2>Overlays</h2>
              <Block title="Dialog · Sheet · Popover · Dropdown · Tooltip · Alert dialog">
                <Dialog>
                  <DialogTrigger asChild><Button variant="outline">Dialog</Button></DialogTrigger>
                  <DialogContent><DialogHeader><DialogTitle>Upgrade to Pro</DialogTitle><DialogDescription>Unlock every component.</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose><Button>Continue</Button></DialogFooter></DialogContent>
                </Dialog>
                <Sheet>
                  <SheetTrigger asChild><Button variant="outline">Sheet</Button></SheetTrigger>
                  <SheetContent><SheetHeader><SheetTitle>Settings</SheetTitle><SheetDescription>Slide-over panel.</SheetDescription></SheetHeader></SheetContent>
                </Sheet>
                <Popover>
                  <PopoverTrigger asChild><Button variant="outline">Popover</Button></PopoverTrigger>
                  <PopoverContent className="text-sm">Anchored floating content.</PopoverContent>
                </Popover>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="outline">Menu</Button></DropdownMenuTrigger>
                  <DropdownMenuContent><DropdownMenuLabel>Account</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem><User /> Profile</DropdownMenuItem><DropdownMenuItem><CreditCard /> Billing</DropdownMenuItem><DropdownMenuItem><LogOut /> Log out</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
                <Tooltip><TooltipTrigger asChild><Button variant="outline">Tooltip</Button></TooltipTrigger><TooltipContent>Helpful hint</TooltipContent></Tooltip>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="destructive">Delete</Button></AlertDialogTrigger>
                  <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                </AlertDialog>
              </Block>
            </section>

            {/* DATA DISPLAY */}
            <section id="data" className="g-section">
              <div className="g-eyebrow">Components</div><h2>Data display</h2>
              <div className="g-grid2">
                <Card>
                  <CardHeader><CardTitle>Upgrade to Pro</CardTitle><CardDescription>Unlock every component.</CardDescription></CardHeader>
                  <CardContent className="text-sm text-muted-foreground">Grayscale, token-driven, ready to ship.</CardContent>
                  <CardFooter><Button>Continue</Button></CardFooter>
                </Card>
                <Block title="Tabs" className="col">
                  <Tabs defaultValue="a" className="w-full"><TabsList><TabsTrigger value="a">Overview</TabsTrigger><TabsTrigger value="b">Details</TabsTrigger></TabsList><TabsContent value="a" className="text-sm text-muted-foreground pt-2">Overview panel.</TabsContent><TabsContent value="b" className="text-sm text-muted-foreground pt-2">Details panel.</TabsContent></Tabs>
                </Block>
                <Block title="Accordion" className="col">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="1"><AccordionTrigger>Is it themed to 2one?</AccordionTrigger><AccordionContent>Yes — every token maps to the 2one system.</AccordionContent></AccordionItem>
                    <AccordionItem value="2"><AccordionTrigger>Light and dark?</AccordionTrigger><AccordionContent>Yes — both themes ship and both pass the APCA audit. Toggle with the ThemeProvider.</AccordionContent></AccordionItem>
                  </Accordion>
                </Block>
                <Block title="Table" className="col">
                  <Table><TableHeader><TableRow><TableHead>Plan</TableHead><TableHead>Seats</TableHead><TableHead className="text-right">Price</TableHead></TableRow></TableHeader>
                    <TableBody>
                      <TableRow><TableCell>Starter</TableCell><TableCell>3</TableCell><TableCell className="text-right">$0</TableCell></TableRow>
                      <TableRow><TableCell>Pro</TableCell><TableCell>10</TableCell><TableCell className="text-right">$49</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </Block>
                <Block title="Badge · Avatar" className="col">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge>Default</Badge><Badge variant="secondary">Secondary</Badge><Badge variant="outline">Outline</Badge><Badge variant="destructive">Error</Badge>
                    <Avatar><AvatarFallback>YK</AvatarFallback></Avatar>
                  </div>
                </Block>
                <Block title="Progress · Skeleton · Separator" className="col">
                  <Progress value={62} className="w-64" />
                  <div className="flex items-center gap-3 w-full"><Skeleton className="size-10 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-3/4" /><Skeleton className="h-3 w-1/2" /></div></div>
                  <div className="flex items-center gap-2 text-sm">Home <Separator orientation="vertical" className="h-4" /> Docs</div>
                </Block>
              </div>
            </section>

            {/* FEEDBACK */}
            <section id="feedback" className="g-section">
              <div className="g-eyebrow">Components</div><h2>Feedback</h2>
              <Block title="Alert · Toast · Spinner" className="col">
                <Alert className="max-w-md"><Rocket /><AlertTitle>Heads up</AlertTitle><AlertDescription>This is the 2one-themed alert.</AlertDescription></Alert>
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={() => toast('Saved', { description: 'Your changes are live.' })}>Show toast</Button>
                  <Spinner /> <Cap>Spinner</Cap>
                </div>
              </Block>
            </section>

            {/* NAVIGATION */}
            <section id="navigation" className="g-section">
              <div className="g-eyebrow">Components</div><h2>Navigation</h2>
              <div className="g-grid2">
                <Block title="Breadcrumb" className="col">
                  <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="#">Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink href="#">Components</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Button</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
                </Block>
                <Block title="Pagination" className="col">
                  <div className="w-full overflow-x-auto">
                    <Pagination><PaginationContent><PaginationItem><PaginationPrevious href="#" /></PaginationItem><PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem><PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem><PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem><PaginationItem><PaginationNext href="#" /></PaginationItem></PaginationContent></Pagination>
                  </div>
                </Block>
              </div>
            </section>

            {/* MOBILE / 2ONE */}
            <section id="mobile" className="g-section">
              <div className="g-eyebrow">Components · 2one-only</div><h2>Mobile &amp; brand</h2>
              <p className="g-lede">The three components shadcn has no equivalent for.</p>
              <div className="g-grid2">
                <Block title="AppBar" className="col">
                  <div className="w-80 rounded-xl border overflow-hidden"><AppBar title="Sign in" onBack={() => {}} trailingSlot={<Avatar className="size-7"><AvatarFallback>Y</AvatarFallback></Avatar>} /></div>
                </Block>
                <Block title="BottomNavItem" className="col">
                  <div className="flex w-80 rounded-xl border overflow-hidden">
                    <BottomNavItem icon={<Home />} label="Home" selected />
                    <BottomNavItem icon={<Search />} label="Search" />
                    <BottomNavItem icon={<Bell />} label="Alerts" />
                    <BottomNavItem icon={<User />} label="Profile" />
                  </div>
                </Block>
                <Block title="Logo" meta="black on light / white on dark">
                  {/* fixed grounds — the mark is demoed on its intended surface, not the page theme's */}
                  <div className="rounded-lg border bg-white p-4"><Logo variant="black" width={120} /></div>
                  <div className="rounded-lg bg-neutral-950 p-4"><Logo variant="white" width={120} /></div>
                </Block>
              </div>
            </section>

            {/* BLOCKS */}
            <section id="blocks" className="g-section">
              <div className="g-eyebrow">Templates</div><h2>Blocks</h2>
              <p className="g-lede">Pre-composed, auto-themed forms built from the 2one components — ready to drop into an app.</p>
              <div className="g-grid2">
                <Block title="login-03" meta="block" className="col"><div className="w-full max-w-sm mx-auto"><Login03 /></div></Block>
                <Block title="login-01" meta="block" className="col"><div className="w-full max-w-sm mx-auto"><Login01 /></div></Block>
                <Block title="signup-01" meta="block" className="col"><div className="w-full max-w-sm mx-auto"><Signup01 /></div></Block>
              </div>
              <Card className="mt-6 gap-4">
                <CardHeader>
                  <CardTitle className="text-base">dashboard-plain</CardTitle>
                  <CardDescription>block · content only, no navigation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[600px] overflow-auto rounded-lg border">
                    <DashboardPlain />
                  </div>
                </CardContent>
              </Card>
              <div className="g-scale-label">All blocks</div>
              <div className="g-index">
                {['login-01', 'login-02', 'login-03', 'login-04', 'login-05', 'signup-01', 'signup-02', 'signup-03', 'dashboard-plain'].map((b) => <span key={b} className="chip">{b}</span>)}
              </div>
            </section>

            {/* CHARTS */}
            <section id="charts" className="g-section">
              <div className="g-eyebrow">Templates · data viz</div><h2>Charts</h2>
              <p className="g-lede">31 chart templates across every type — grayscale by default (the <code>--chart-1…5</code> tokens map to the neutral ramp, no hues). One of each type shown; the full set lives in <code>src/blocks/charts/</code>.</p>
              <div className="g-grid2">
                <ChartArea />
                <ChartBarMultiple />
                <ChartLineMultiple />
                <ChartRadarDefault />
                <ChartPieDonutText />
                <ChartRadialStacked />
              </div>
              <div className="g-scale-label">All 31 charts</div>
              <div className="g-index">
                {['area-default','area-linear','area-stacked','area-legend','area-interactive','bar-default','bar-horizontal','bar-multiple','bar-stacked','bar-label','bar-interactive','line-default','line-multiple','line-dots','line-label','line-interactive','pie-simple','pie-label','pie-donut','pie-donut-text','pie-interactive','radar-default','radar-dots','radar-multiple','radar-legend','radial-simple','radial-label','radial-grid','radial-stacked','tooltip-default','tooltip-advanced'].map((c) => <span key={c} className="chip">chart-{c}</span>)}
              </div>
            </section>

            {/* INDEX */}
            <section id="index" className="g-section">
              <div className="g-eyebrow">Reference</div><h2>All components</h2>
              <p className="g-lede">Every export in the package — 54 shadcn primitives + 3 2one-only. Click any to open it in the <a className="underline underline-offset-2" href="/graph.html">knowledge graph</a>.</p>
              <div className="g-index">
                {GRAPH_COMPONENTS.map((c) => (
                  <a key={c.id} className="chip" href={`/graph.html?node=${encodeURIComponent(c.id)}`} title={`${c.label} — open in the knowledge graph`}>{c.label}</a>
                ))}
              </div>
            </section>

            <footer className="mt-16 border-t pt-8 text-sm text-muted-foreground">@yokesh-2one/design-library · shadcn/ui re-skinned to the 2one tokens · light + audited dark · rendered live from the real components.</footer>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </TooltipProvider>
  )
}

function OtpDemo() {
  const [v, setV] = useState('482')
  return (
    <InputOTP maxLength={6} value={v} onChange={setV}>
      <InputOTPGroup>{[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup>
    </InputOTP>
  )
}

function Swatches({ items, prefix }: { items: string[]; prefix: string }) {
  const [hex, setHex] = useState<Record<string, string>>({})
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement)
    const next: Record<string, string> = {}
    items.forEach((k) => { next[k] = cs.getPropertyValue(`--color-${prefix}${k}`).trim() })
    setHex(next)
  }, [items, prefix])
  return (
    <div className="g-swatches">
      {items.map((k) => (
        <div className="g-sw" key={k}>
          <div className="chip" style={{ background: `var(--color-${prefix}${k})` }} />
          <div className="m"><div>{prefix}{k}</div><div className="hx">{hex[k]}</div></div>
        </div>
      ))}
    </div>
  )
}
