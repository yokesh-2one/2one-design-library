/*
  DLS Studio — an interactive UI for a CLIENT to build their own Design Language
  System on top of the 2one architecture, across the three tiers:

    Tier 1 · Brand       — filled in manually (name, voice, accent, logo).
    Tier 2 · Tokens      — integrated from Figma or Claude Design, OR filled in
                           manually (colour / radius / type editor + live preview).
    Tier 3 · Components  — connected from a front-end library over MCP or imported
                           from Figma. Every import is gated on the 2one checks
                           passing, then reskinned to the client's brand.

  This is a designed, interactive prototype composed ENTIRELY from real 2one
  components (Sidebar, Card, Tabs, Field, Badge, Table, Alert, Progress …). The
  Figma / Claude Design / MCP connections are represented as connect-flows with
  real states — the live calls need connector authorization, which happens
  outside this page. Nothing here is hand-rolled chrome; state is real React state.
*/
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'next-themes'
import {
  Building2, Palette, Blocks, CircleCheck, CircleX, TriangleAlert, Upload, Plug,
  Wand2, Download, ArrowRight, Sun, Moon, Frame, Sparkles, PencilLine, ShieldCheck,
  Type, Ruler, Circle, Loader2,
} from 'lucide-react'

import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Field, FieldLabel, FieldDescription, FieldGroup } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import {
  Sidebar, SidebarClose, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader,
  SidebarInset, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger, useSidebar,
} from '@/components/ui/sidebar'
import { TopNav } from './global-nav'
import { LanguageToggle } from './i18n/language-toggle'

// ── shared shell bits (same contract as the other dev pages) ───────────────────
function ThemeToggle() {
  const { t } = useTranslation()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const isDark = mounted && resolvedTheme === 'dark'
  return (
    <Button variant="outline" size="sm" aria-label={isDark ? t('common.switchToLight') : t('common.switchToDark')} onClick={() => setTheme(isDark ? 'light' : 'dark')}>
      {isDark ? <Sun /> : <Moon />}
      {isDark ? t('common.light') : t('common.dark')}
    </Button>
  )
}

function TopBarLogo() {
  const { t } = useTranslation()
  const { state, isMobile } = useSidebar()
  if (state === 'expanded' && !isMobile) return null
  return (
    <>
      <a href="/" className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={t('common.dashboardAria')}>
        <Logo variant="black" width={46} className="dark:hidden" />
        <Logo variant="white" width={46} className="hidden dark:block" />
      </a>
      <Separator orientation="vertical" className="mx-1 !h-5" />
    </>
  )
}

// ── a single 2one-check row: icon + text (never colour alone) ──────────────────
function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-2 text-sm">
      {ok
        ? <CircleCheck className="size-4 text-success" aria-hidden />
        : <CircleX className="size-4 text-destructive" aria-hidden />}
      <span className={ok ? '' : 'text-foreground'}>{label}</span>
      <span className={'ml-auto text-xs font-medium ' + (ok ? 'text-success' : 'text-destructive')}>
        {ok ? t('studio.checks.pass') : t('studio.checks.fail')}
      </span>
    </div>
  )
}

// The DLS gate a client component must clear before it can be added + reskinned.
const CHECK_KEYS = ['tokensOnly', 'pillRadius', 'lucideIcons', 'apcaContrast', 'noColourAlone', 'focusVisible'] as const

// Demo import set — a front-end library's components, each with which checks it
// currently clears. Position/label carry meaning (not colour), per the rules.
type Imported = { id: string; checks: Record<string, boolean> }
const IMPORTED: Imported[] = [
  { id: 'Button',   checks: { tokensOnly: true,  pillRadius: false, lucideIcons: true,  apcaContrast: true,  noColourAlone: true,  focusVisible: true } },
  { id: 'Card',     checks: { tokensOnly: true,  pillRadius: true,  lucideIcons: true,  apcaContrast: true,  noColourAlone: true,  focusVisible: true } },
  { id: 'Input',    checks: { tokensOnly: true,  pillRadius: true,  lucideIcons: true,  apcaContrast: true,  noColourAlone: true,  focusVisible: true } },
  { id: 'Select',   checks: { tokensOnly: true,  pillRadius: true,  lucideIcons: false, apcaContrast: true,  noColourAlone: true,  focusVisible: true } },
  { id: 'Badge',    checks: { tokensOnly: false, pillRadius: true,  lucideIcons: true,  apcaContrast: false, noColourAlone: false, focusVisible: true } },
  { id: 'Table',    checks: { tokensOnly: true,  pillRadius: true,  lucideIcons: true,  apcaContrast: true,  noColourAlone: true,  focusVisible: true } },
  { id: 'Dialog',   checks: { tokensOnly: true,  pillRadius: true,  lucideIcons: true,  apcaContrast: true,  noColourAlone: true,  focusVisible: false } },
  { id: 'Tooltip',  checks: { tokensOnly: true,  pillRadius: true,  lucideIcons: true,  apcaContrast: true,  noColourAlone: true,  focusVisible: true } },
]
const allPass = (c: Imported) => CHECK_KEYS.every((k) => c.checks[k])

const ACCENT_PRESETS = ['#30a1ff', '#7c5cff', '#e8431c', '#15803d', '#0f172a']

export function Studio() {
  const { t } = useTranslation()
  const [step, setStep] = useState<'brand' | 'tokens' | 'components' | 'review'>('brand')

  // Tier 1 — brand (manual)
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [mission, setMission] = useState('')
  const [logoName, setLogoName] = useState('')
  const [accent, setAccent] = useState('#30a1ff')

  // Tier 2 — tokens
  const [tokenSource, setTokenSource] = useState<'figma' | 'claude' | 'manual'>('manual')
  const [connect, setConnect] = useState<'idle' | 'connecting' | 'connected'>('idle')
  const [radius, setRadius] = useState<'sm' | 'md' | 'lg' | 'full'>('full')

  // Tier 3 — components
  const [library, setLibrary] = useState('')
  const [imported, setImported] = useState(false)
  const [reskinned, setReskinned] = useState(true)
  const [sel, setSel] = useState('Button')

  // completion signals (drive the sidebar badges + review)
  const brandDone = name.trim().length > 0
  const tokensDone = tokenSource === 'manual' ? true : connect === 'connected'
  const passing = IMPORTED.filter(allPass)
  const componentsDone = imported && passing.length > 0
  const doneCount = [brandDone, tokensDone, componentsDone].filter(Boolean).length
  const overall = Math.round((doneCount / 3) * 100)

  const TIERS = [
    { id: 'brand',      label: t('studio.nav.brand'),      icon: Building2, done: brandDone },
    { id: 'tokens',     label: t('studio.nav.tokens'),     icon: Palette,   done: tokensDone },
    { id: 'components', label: t('studio.nav.components'), icon: Blocks,    done: componentsDone },
    { id: 'review',     label: t('studio.nav.review'),     icon: ShieldCheck, done: overall === 100 },
  ] as const

  const startConnect = () => {
    setConnect('connecting')
    window.setTimeout(() => setConnect('connected'), 900)
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between gap-2">
            <a href="/" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={t('common.dashboardAria')}>
              <Logo variant="black" width={52} className="dark:hidden" />
              <Logo variant="white" width={52} className="hidden dark:block" />
            </a>
            <SidebarClose />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t('studio.nav.groupLabel')}</SidebarGroupLabel>
            <SidebarMenu>
              {TIERS.map((tr) => (
                <SidebarMenuItem key={tr.id}>
                  <SidebarMenuButton isActive={step === tr.id} onClick={() => setStep(tr.id)}>
                    <tr.icon />
                    <span>{tr.label}</span>
                  </SidebarMenuButton>
                  {tr.done && (
                    <SidebarMenuBadge>
                      <CircleCheck className="size-4 text-foreground" aria-label={t('studio.stepComplete')} />
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur">
          <SidebarTrigger />
          <TopBarLogo />
          <TopNav current="/studio.html" />
          <div className="ml-auto flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>

        <div className="mx-auto w-full min-w-0 max-w-7xl px-6 pb-32 lg:px-10">
          {/* HERO */}
          <section className="pt-10">
            <div className="g-eyebrow">{t('studio.eyebrow')}</div>
            <h1 className="text-h2 font-bold tracking-tight">{t('studio.title')}</h1>
            <p className="mt-3 max-w-[68ch] text-muted-foreground">{t('studio.lede')}</p>
            <div className="mt-5 flex items-center gap-3">
              <Progress value={overall} className="max-w-xs" aria-label={t('studio.progressAria')} />
              <span className="text-sm text-muted-foreground">{t('studio.progress', { done: doneCount, total: 3 })}</span>
            </div>
          </section>

          <Separator className="my-8" />

          {/* ── TIER 1 · BRAND ─────────────────────────────────────────── */}
          {step === 'brand' && (
            <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div>
                <TierHeading n="1" title={t('studio.brand.title')} desc={t('studio.brand.desc')} mode={t('studio.mode.manual')} />
                <Card>
                  <CardContent className="pt-6">
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="s-name">{t('studio.brand.name')}</FieldLabel>
                        <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('studio.brand.namePlaceholder')} />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="s-tag">{t('studio.brand.tagline')}</FieldLabel>
                        <Input id="s-tag" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder={t('studio.brand.taglinePlaceholder')} />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="s-mission">{t('studio.brand.mission')}</FieldLabel>
                        <Textarea id="s-mission" value={mission} onChange={(e) => setMission(e.target.value)} placeholder={t('studio.brand.missionPlaceholder')} rows={3} />
                        <FieldDescription>{t('studio.brand.missionHint')}</FieldDescription>
                      </Field>
                      <Field>
                        <FieldLabel>{t('studio.brand.accent')}</FieldLabel>
                        <div className="flex items-center gap-2">
                          {ACCENT_PRESETS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setAccent(c)}
                              aria-label={t('studio.brand.useAccent', { hex: c })}
                              aria-pressed={accent === c}
                              className={'size-7 rounded-full ring-offset-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' + (accent === c ? 'ring-2 ring-ring' : '')}
                              style={{ background: c }}
                            />
                          ))}
                          <label className="ml-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
                            <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="size-7 cursor-pointer rounded-full border border-input bg-transparent p-0" aria-label={t('studio.brand.customAccent')} />
                            <span className="mono text-xs">{accent}</span>
                          </label>
                        </div>
                        <FieldDescription>{t('studio.brand.accentHint')}</FieldDescription>
                      </Field>
                      <Field>
                        <FieldLabel>{t('studio.brand.logo')}</FieldLabel>
                        {logoName
                          ? (
                            <div className="flex items-center gap-2 text-sm">
                              <CircleCheck className="size-4 text-foreground" aria-hidden />
                              <span className="mono">{logoName}</span>
                              <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setLogoName('')}>{t('studio.brand.replace')}</Button>
                            </div>
                          )
                          : (
                            <Button variant="outline" onClick={() => setLogoName('brand-logo.svg')}>
                              <Upload /> {t('studio.brand.uploadLogo')}
                            </Button>
                          )}
                        <FieldDescription>{t('studio.brand.logoHint')}</FieldDescription>
                      </Field>
                    </FieldGroup>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => setStep('tokens')} disabled={!brandDone}>
                      {t('studio.brand.next')} <ArrowRight />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              <BrandPreview name={name} tagline={tagline} accent={accent} />
            </section>
          )}

          {/* ── TIER 2 · TOKENS ────────────────────────────────────────── */}
          {step === 'tokens' && (
            <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div>
                <TierHeading n="2" title={t('studio.tokens.title')} desc={t('studio.tokens.desc')} mode={t('studio.mode.integrateOrManual')} />
                <Tabs value={tokenSource} onValueChange={(v) => { setTokenSource(v as typeof tokenSource); setConnect('idle') }}>
                  <TabsList className="w-full">
                    <TabsTrigger value="figma"><Frame /> {t('studio.tokens.figma')}</TabsTrigger>
                    <TabsTrigger value="claude"><Sparkles /> {t('studio.tokens.claude')}</TabsTrigger>
                    <TabsTrigger value="manual"><PencilLine /> {t('studio.tokens.manual')}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="figma"><ConnectPanel source="figma" status={connect} onConnect={startConnect} /></TabsContent>
                  <TabsContent value="claude"><ConnectPanel source="claude" status={connect} onConnect={startConnect} /></TabsContent>
                  <TabsContent value="manual">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">{t('studio.tokens.manualTitle')}</CardTitle>
                        <CardDescription>{t('studio.tokens.manualDesc')}</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-6">
                        <Field>
                          <FieldLabel className="flex items-center gap-2"><Palette className="size-4" /> {t('studio.brand.accent')}</FieldLabel>
                          <div className="flex items-center gap-2">
                            {ACCENT_PRESETS.map((c) => (
                              <button key={c} type="button" onClick={() => setAccent(c)} aria-label={t('studio.brand.useAccent', { hex: c })} aria-pressed={accent === c}
                                className={'size-7 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' + (accent === c ? 'ring-2 ring-ring ring-offset-2 ring-offset-background' : '')}
                                style={{ background: c }} />
                            ))}
                          </div>
                        </Field>
                        <Field>
                          <FieldLabel className="flex items-center gap-2"><Ruler className="size-4" /> {t('studio.tokens.radius')}</FieldLabel>
                          <RadioGroup value={radius} onValueChange={(v) => setRadius(v as typeof radius)} className="flex flex-wrap gap-4">
                            {(['sm', 'md', 'lg', 'full'] as const).map((r) => (
                              <label key={r} className="flex items-center gap-2 text-sm">
                                <RadioGroupItem value={r} /> {t(`studio.tokens.radius_${r}`)}
                              </label>
                            ))}
                          </RadioGroup>
                        </Field>
                        <Field>
                          <FieldLabel className="flex items-center gap-2"><Type className="size-4" /> {t('studio.tokens.type')}</FieldLabel>
                          <FieldDescription>{t('studio.tokens.typeFixed')}</FieldDescription>
                        </Field>
                      </CardContent>
                      <CardFooter>
                        <Button onClick={() => setStep('components')}>{t('studio.tokens.next')} <ArrowRight /></Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
              <TokenPreview accent={accent} radius={radius} />
            </section>
          )}

          {/* ── TIER 3 · COMPONENTS ────────────────────────────────────── */}
          {step === 'components' && (
            <section>
              <TierHeading n="3" title={t('studio.components.title')} desc={t('studio.components.desc')} mode={t('studio.mode.mcpOrFigma')} />

              {!imported
                ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{t('studio.components.connectTitle')}</CardTitle>
                      <CardDescription>{t('studio.components.connectDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      <Field>
                        <FieldLabel>{t('studio.components.pickLibrary')}</FieldLabel>
                        <RadioGroup value={library} onValueChange={setLibrary} className="grid gap-2 sm:grid-cols-2">
                          {['shadcn/ui', 'Material UI', 'MudBlazor', 'Vuetify'].map((lib) => (
                            <label key={lib} className="flex items-center gap-2 rounded-md border p-3 text-sm has-[:checked]:border-brand">
                              <RadioGroupItem value={lib} /> <Plug className="size-4 text-muted-foreground" /> {lib}
                              <Badge variant="secondary" className="ml-auto text-[11px] font-normal">{t('studio.components.viaMcp')}</Badge>
                            </label>
                          ))}
                        </RadioGroup>
                      </Field>
                      <Alert>
                        <TriangleAlert />
                        <AlertTitle>{t('studio.connect.authTitle')}</AlertTitle>
                        <AlertDescription>{t('studio.components.figmaAlt')}</AlertDescription>
                      </Alert>
                    </CardContent>
                    <CardFooter className="gap-2">
                      <Button disabled={!library} onClick={() => setImported(true)}><Plug /> {t('studio.components.connect')}</Button>
                      <Button variant="outline" onClick={() => { setLibrary('Figma library'); setImported(true) }}><Frame /> {t('studio.components.importFigma')}</Button>
                    </CardFooter>
                  </Card>
                )
                : (
                  <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                    <div className="grid gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Plug className="size-4" /> {library}
                            <Badge variant="secondary" className="font-normal">{t('studio.components.connected')}</Badge>
                          </CardTitle>
                          <CardDescription>{t('studio.components.gateDesc', { pass: passing.length, total: IMPORTED.length })}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <Table className="tabular-nums">
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t('studio.components.component')}</TableHead>
                                  <TableHead>{t('studio.components.checks')}</TableHead>
                                  <TableHead className="text-right">{t('studio.components.status')}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {IMPORTED.map((c) => {
                                  const ok = allPass(c)
                                  const passed = CHECK_KEYS.filter((k) => c.checks[k]).length
                                  return (
                                    <TableRow key={c.id} className="cursor-pointer" onClick={() => setSel(c.id)} data-state={sel === c.id ? 'selected' : undefined}>
                                      <TableCell className="font-medium">{c.id}</TableCell>
                                      <TableCell className="text-muted-foreground">{t('studio.components.checksCount', { passed, total: CHECK_KEYS.length })}</TableCell>
                                      <TableCell className="text-right">
                                        <span className={'inline-flex items-center gap-1.5 text-xs font-medium ' + (ok ? 'text-success' : 'text-destructive')}>
                                          {ok ? <CircleCheck className="size-4" aria-hidden /> : <CircleX className="size-4" aria-hidden />}
                                          {ok ? t('studio.components.added') : t('studio.components.blocked')}
                                        </span>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                        <CardFooter className="flex-wrap gap-3">
                          <Button onClick={() => setStep('review')}><Wand2 /> {t('studio.components.reskinAdd', { n: passing.length })}</Button>
                          <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Switch checked={reskinned} onCheckedChange={setReskinned} /> {t('studio.components.reskinToggle')}
                          </label>
                        </CardFooter>
                      </Card>

                      {/* selected component — the gate detail */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">{t('studio.components.gateFor', { name: sel })}</CardTitle>
                          <CardDescription>{t('studio.components.gateHint')}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-2.5">
                          {CHECK_KEYS.map((k) => (
                            <CheckRow key={k} ok={IMPORTED.find((c) => c.id === sel)!.checks[k]} label={t(`studio.checks.${k}`)} />
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                    <ReskinPreview accent={accent} radius={radius} reskinned={reskinned} />
                  </div>
                )}
            </section>
          )}

          {/* ── REVIEW & GENERATE ──────────────────────────────────────── */}
          {step === 'review' && (
            <section className="grid gap-6">
              <TierHeading n="✓" title={t('studio.review.title')} desc={t('studio.review.desc')} mode={t('studio.mode.review')} />
              <div className="grid gap-4 sm:grid-cols-3">
                <SummaryCard icon={Building2} title={t('studio.nav.brand')} done={brandDone} value={name || t('studio.review.notSet')} sub={t('studio.mode.manual')} />
                <SummaryCard icon={Palette} title={t('studio.nav.tokens')} done={tokensDone} value={t(`studio.tokens.${tokenSource}`)} sub={t('studio.review.tokensSub', { radius: t(`studio.tokens.radius_${radius}`) })} />
                <SummaryCard icon={Blocks} title={t('studio.nav.components')} done={componentsDone} value={componentsDone ? t('studio.review.componentsVal', { pass: passing.length, total: IMPORTED.length }) : t('studio.review.notSet')} sub={reskinned ? t('studio.review.reskinned') : t('studio.review.original')} />
              </div>

              {overall === 100
                ? (
                  <Alert>
                    <CircleCheck />
                    <AlertTitle>{t('studio.review.readyTitle')}</AlertTitle>
                    <AlertDescription>{t('studio.review.readyDesc')}</AlertDescription>
                  </Alert>
                )
                : (
                  <Alert variant="destructive">
                    <TriangleAlert />
                    <AlertTitle>{t('studio.review.incompleteTitle')}</AlertTitle>
                    <AlertDescription>{t('studio.review.incompleteDesc')}</AlertDescription>
                  </Alert>
                )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('studio.review.exportTitle')}</CardTitle>
                  <CardDescription>{t('studio.review.exportDesc')}</CardDescription>
                </CardHeader>
                <CardFooter className="flex-wrap gap-2">
                  <Button disabled={overall !== 100}><Wand2 /> {t('studio.review.generate')}</Button>
                  <Button variant="outline"><Download /> tokens.json</Button>
                  <Button variant="outline"><Download /> manifest.json</Button>
                </CardFooter>
              </Card>
            </section>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// ── small building blocks (still composed from DLS primitives) ─────────────────
function TierHeading({ n, title, desc, mode }: { n: string; title: string; desc: string; mode: string }) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center gap-2">
        <Badge variant="outline" className="rounded-full">{n}</Badge>
        <Badge variant="secondary" className="font-normal">{mode}</Badge>
      </div>
      <h2 className="text-h4 font-bold tracking-tight">{title}</h2>
      <p className="mt-1 max-w-[60ch] text-sm text-muted-foreground">{desc}</p>
    </div>
  )
}

function BrandPreview({ name, tagline, accent }: { name: string; tagline: string; accent: string }) {
  const { t } = useTranslation()
  return (
    <div className="lg:sticky lg:top-20 lg:self-start">
      <div className="g-eyebrow">{t('studio.previewLabel')}</div>
      <Card style={{ ['--acc' as string]: accent }}>
        <CardHeader>
          <CardTitle>{name || t('studio.brand.namePlaceholder')}</CardTitle>
          <CardDescription>{tagline || t('studio.brand.taglinePlaceholder')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="h-1.5 w-16 rounded-full" style={{ background: 'var(--acc)' }} />
          <a href="#" className="text-sm font-medium" style={{ color: 'var(--acc)' }}>{t('studio.preview.sampleLink')} →</a>
          <Button className="w-fit">{t('studio.preview.primary')}</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function TokenPreview({ accent, radius }: { accent: string; radius: string }) {
  const { t } = useTranslation()
  const r = radius === 'full' ? '999px' : radius === 'lg' ? '12px' : radius === 'md' ? '8px' : '4px'
  return (
    <div className="lg:sticky lg:top-20 lg:self-start">
      <div className="g-eyebrow">{t('studio.previewLabel')}</div>
      <Card style={{ ['--acc' as string]: accent }}>
        <CardHeader><CardTitle className="text-base">{t('studio.preview.tokens')}</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center gap-2">
            {[1, 0.7, 0.45, 0.25, 0.1].map((o, i) => (
              <div key={i} className="size-8 rounded-md border" style={{ background: `color-mix(in srgb, var(--acc) ${o * 100}%, var(--background))` }} />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center border px-4 py-2 text-sm font-medium text-primary-foreground" style={{ background: 'var(--acc)', borderRadius: r }}>{t('studio.preview.primary')}</span>
            <span className="inline-flex items-center border px-4 py-2 text-sm" style={{ borderRadius: r }}>{t('studio.preview.secondary')}</span>
          </div>
          <p className="text-sm text-muted-foreground">{t('studio.preview.typeSample')}</p>
        </CardContent>
      </Card>
    </div>
  )
}

function ReskinPreview({ accent, radius, reskinned }: { accent: string; radius: string; reskinned: boolean }) {
  const { t } = useTranslation()
  const r = reskinned ? (radius === 'full' ? '999px' : radius === 'lg' ? '12px' : '8px') : '4px'
  return (
    <div className="lg:sticky lg:top-20 lg:self-start">
      <div className="g-eyebrow">
        {reskinned ? t('studio.reskin.after') : t('studio.reskin.before')}
      </div>
      <Card style={{ ['--acc' as string]: accent }}>
        <CardContent className="grid gap-3 pt-6">
          <span className="inline-flex w-fit items-center px-4 py-2 text-sm font-medium"
            style={reskinned ? { background: 'var(--acc)', color: '#fff', borderRadius: r } : { background: '#e5e7eb', color: '#111', borderRadius: r, fontFamily: 'Times New Roman, serif' }}>
            {t('studio.preview.primary')}
          </span>
          <div className="border p-3" style={{ borderRadius: reskinned ? '12px' : '2px' }}>
            <div className="text-sm font-medium">{t('studio.reskin.card')}</div>
            <div className="text-xs text-muted-foreground">{reskinned ? t('studio.reskin.onBrand') : t('studio.reskin.foreign')}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ConnectPanel({ source, status, onConnect }: { source: 'figma' | 'claude'; status: 'idle' | 'connecting' | 'connected'; onConnect: () => void }) {
  const { t } = useTranslation()
  const label = source === 'figma' ? t('studio.tokens.figma') : t('studio.tokens.claude')
  return (
    <Card>
      {status === 'connected'
        ? (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CircleCheck className="size-4 text-foreground" /> {t('studio.connect.connectedTo', { source: label })}
                <Badge variant="secondary" className="font-normal">{t('studio.connect.demo')}</Badge>
              </CardTitle>
              <CardDescription>{t('studio.connect.imported')}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              {['#30a1ff', '#0f172a', '#52525b', '#dcdce0'].map((c) => <div key={c} className="size-8 rounded-md border" style={{ background: c }} />)}
            </CardContent>
          </>
        )
        : (
          <CardContent className="py-4">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">{source === 'figma' ? <Frame /> : <Sparkles />}</EmptyMedia>
                <EmptyTitle>{t('studio.connect.title', { source: label })}</EmptyTitle>
                <EmptyDescription>{t('studio.connect.desc', { source: label })}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={onConnect} disabled={status === 'connecting'}>
                  {status === 'connecting' ? <Loader2 className="animate-spin motion-reduce:animate-none" /> : <Plug />}
                  {status === 'connecting' ? t('studio.connect.connecting') : t('studio.connect.connect', { source: label })}
                </Button>
                <Alert className="mt-4 text-left">
                  <TriangleAlert />
                  <AlertTitle>{t('studio.connect.authTitle')}</AlertTitle>
                  <AlertDescription>{t('studio.connect.authDesc')}</AlertDescription>
                </Alert>
              </EmptyContent>
            </Empty>
          </CardContent>
        )}
    </Card>
  )
}

function SummaryCard({ icon: Icon, title, done, value, sub }: { icon: typeof Building2; title: string; done: boolean; value: string; sub: string }) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="size-4" /> {title}
          {done
            ? <CircleCheck className="ml-auto size-4 text-foreground" aria-label={t('studio.stepComplete')} />
            : <Circle className="ml-auto size-4 text-muted-foreground" aria-label={t('studio.stepIncomplete')} />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="truncate font-medium">{value}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  )
}
