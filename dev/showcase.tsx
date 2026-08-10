import { useEffect, useState } from 'react'
import {
  Star, Bold, Italic, Underline, Search, Mail, Bell, Home, User, Settings, Plus,
  ChevronRight, Rocket, CreditCard, LogOut, Check,
} from 'lucide-react'
import { toast } from 'sonner'

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

import { Logo } from '@/components/logo'
import { AppBar } from '@/components/app-bar'
import { BottomNavItem } from '@/components/bottom-nav-item'

// blocks (templates)
import { LoginForm as Login01 } from '@/blocks/login-01'
import { LoginForm as Login03 } from '@/blocks/login-03'
import { SignupForm as Signup01 } from '@/blocks/signup-01'
import { DashboardPlain } from '@/blocks/dashboard-plain/page'

/* ---------- foundation data (from tokens/*.css) ---------- */
const NEUTRAL: [string, string][] = [['50', '#fafafa'], ['100', '#f4f4f5'], ['200', '#e4e4e7'], ['300', '#d4d4d8'], ['400', '#a1a1aa'], ['600', '#52525b'], ['700', '#3f3f46'], ['800', '#27272a'], ['950', '#09090b']]
const ACCENT: [string, string][] = [['50', '#fafafa'], ['100', '#f4f4f4'], ['200', '#e4e4e4'], ['300', '#d1d1d1'], ['600', '#404040'], ['700', '#262626'], ['800', '#171717'], ['950', '#000000']]
const SEM: [string, string][] = [['danger-500', '#ef4444'], ['danger-600', '#dc2626'], ['success-600', '#15803d']]
const TYPE: [string, string, string][] = [['display', 'text-display', '76 / 103'], ['h1', 'text-h1', '62 / 84'], ['h2', 'text-h2', '48 / 65'], ['h3', 'text-h3', '40 / 54'], ['h4', 'text-h4', '32 / 43'], ['h5', 'text-h5', '26 / 35'], ['h6', 'text-h6', '20 / 27'], ['base', 'text-base', '16 · body'], ['sm', 'text-sm', '14 · UI'], ['xs', 'text-xs', '12 · small']]
const RADII = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full']

const ALL_COMPONENTS = ['Accordion', 'Alert', 'AlertDialog', 'AspectRatio', 'Avatar', 'Badge', 'Breadcrumb', 'Button', 'ButtonGroup', 'Calendar', 'Card', 'Carousel', 'Chart', 'Checkbox', 'Collapsible', 'Command', 'ContextMenu', 'Dialog', 'Drawer', 'DropdownMenu', 'Empty', 'Field', 'Form', 'HoverCard', 'Input', 'InputGroup', 'InputOTP', 'Item', 'Kbd', 'Label', 'Menubar', 'NativeSelect', 'NavigationMenu', 'Pagination', 'Popover', 'Progress', 'RadioGroup', 'Resizable', 'ScrollArea', 'Select', 'Separator', 'Sheet', 'Sidebar', 'Skeleton', 'Slider', 'Sonner', 'Spinner', 'Switch', 'Table', 'Tabs', 'Textarea', 'Toggle', 'ToggleGroup', 'Tooltip', 'Logo', 'AppBar', 'BottomNavItem']

const NAV = [
  { grp: '', items: [['overview', 'Overview', '']] },
  { grp: 'Foundations', items: [['color', 'Colour', ''], ['type', 'Typography', ''], ['radius', 'Radius', '']] },
  { grp: 'Components', items: [['actions', 'Actions', ''], ['forms', 'Forms', ''], ['overlays', 'Overlays', ''], ['data', 'Data display', ''], ['feedback', 'Feedback', ''], ['navigation', 'Navigation', ''], ['mobile', 'Mobile · 2one', '']] },
  { grp: 'Templates', items: [['blocks', 'Blocks', '8']] },
  { grp: 'Reference', items: [['index', 'All components', '57']] },
]

const LogoMark = () => <Logo variant="black" width={58} className="dark:hidden" />

function Block({ title, meta, className = '', children }: { title: string; meta?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className="g-block">
      <div className="g-block-head"><h3>{title}</h3>{meta && <span className="meta">{meta}</span>}</div>
      <div className={`g-stage ${className}`}>{children}</div>
    </div>
  )
}
const Cap = ({ children }: { children: React.ReactNode }) => <span className="g-cap">{children}</span>

export function Showcase() {
  const [chrome, setChrome] = useState<'light' | 'dark'>('light')
  const [menu, setMenu] = useState(false)
  const [active, setActive] = useState('overview')

  useEffect(() => { document.documentElement.setAttribute('data-chrome', chrome) }, [chrome])

  useEffect(() => {
    const secs = Array.from(document.querySelectorAll('.g-section[id]'))
    const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) }), { rootMargin: '-45% 0px -50% 0px' })
    secs.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  return (
    <TooltipProvider delayDuration={200}>
      <div className="guide" data-chrome={chrome}>
        <div className="g-shell">
          {/* sidebar */}
          <aside className={`g-side ${menu ? 'open' : ''}`}>
            <div className="g-brand">
              <span style={{ filter: chrome === 'dark' ? 'invert(1)' : 'none' }}><Logo variant="black" width={60} /></span>
              <span className="sub">design language<br />system</span>
            </div>
            <nav className="g-nav">
              {NAV.map((g, i) => (
                <div key={i}>
                  {g.grp && <div className="grp">{g.grp}</div>}
                  {g.items.map(([id, label, n]) => (
                    <a key={id} href={`#${id}`} className={active === id ? 'active' : ''} onClick={() => setMenu(false)}>
                      <span>{label}</span>{n && <span className="n">{n}</span>}
                    </a>
                  ))}
                </div>
              ))}
            </nav>
          </aside>
          <div className={`g-scrim ${menu ? 'open' : ''}`} onClick={() => setMenu(false)} />

          {/* main */}
          <main className="g-main">
            <div className="g-top">
              <div className="g-repo">
                <button className="g-toggle g-menu-btn" onClick={() => setMenu(true)}>☰</button>
                <span><b>@yokesh-2one/design-library</b></span>
                <span className="g-dot" /><span>shadcn · 2one-themed</span>
              </div>
              <button className="g-toggle" onClick={() => setChrome((c) => (c === 'dark' ? 'light' : 'dark'))}>
                {chrome === 'dark' ? '☾ Dark' : '☀ Light'}
              </button>
            </div>

            {/* OVERVIEW */}
            <section id="overview" className="g-section g-hero">
              <div className="g-eyebrow">2one · design language system</div>
              <h1>The 2one system, <span className="thin">built on shadcn/ui.</span></h1>
              <p>Every component on this page is the real <span className="mono">@yokesh-2one/design-library</span> — the shadcn/ui set re-skinned to the 2one tokens. Grayscale, light-only, pill buttons, Satoshi headings, Inter body.</p>
              <div className="g-stats">
                <div className="g-stat"><div className="k">57</div><div className="l">Components</div></div>
                <div className="g-stat"><div className="k">54</div><div className="l">shadcn primitives</div></div>
                <div className="g-stat"><div className="k">3</div><div className="l">2one-only</div></div>
                <div className="g-stat"><div className="k">1</div><div className="l">Hue-free system</div></div>
              </div>
              <div className="g-grid2">
                <div><div className="g-scale-label">Install</div><pre className="g-code"><span className="c"># React 19 · Tailwind v4</span>{'\n'}npm install @yokesh-2one/design-library</pre></div>
                <div><div className="g-scale-label">Use</div><pre className="g-code">{`import { Button } from '@yokesh-2one/design-library'`}{'\n'}{`import '@yokesh-2one/design-library/styles'`}</pre></div>
              </div>
            </section>

            {/* COLOUR */}
            <section id="color" className="g-section">
              <div className="g-eyebrow">Foundations</div><h2>Colour</h2>
              <p className="g-lede">Grayscale by design — no brand hue. <b>danger</b> and <b>success</b> are the only colours, reserved for validation.</p>
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
              <div style={{ marginTop: 16 }}>
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
              <div className="g-radii" style={{ marginTop: 14 }}>
                {RADII.map((r) => <div className="g-rd" key={r} style={{ borderRadius: r === 'full' ? 22 : `var(--radius-${r})` }}>{r}</div>)}
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
              <div className="g-grid2" style={{ marginTop: 18 }}>
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
                  <div className="grid w-full max-w-sm gap-1.5"><Label htmlFor="pw">Password</Label><Input id="pw" type="password" aria-invalid defaultValue="123" /></div>
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
                <Block title="Card" className="col">
                  <Card className="w-full">
                    <CardHeader><CardTitle>Upgrade to Pro</CardTitle><CardDescription>Unlock every component.</CardDescription></CardHeader>
                    <CardContent className="text-sm text-muted-foreground">Grayscale, token-driven, ready to ship.</CardContent>
                    <CardFooter><Button>Continue</Button></CardFooter>
                  </Card>
                </Block>
                <Block title="Tabs" className="col">
                  <Tabs defaultValue="a" className="w-full"><TabsList><TabsTrigger value="a">Overview</TabsTrigger><TabsTrigger value="b">Details</TabsTrigger></TabsList><TabsContent value="a" className="text-sm text-muted-foreground pt-2">Overview panel.</TabsContent><TabsContent value="b" className="text-sm text-muted-foreground pt-2">Details panel.</TabsContent></Tabs>
                </Block>
                <Block title="Accordion" className="col">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="1"><AccordionTrigger>Is it themed to 2one?</AccordionTrigger><AccordionContent>Yes — every token maps to the 2one system.</AccordionContent></AccordionItem>
                    <AccordionItem value="2"><AccordionTrigger>Light only?</AccordionTrigger><AccordionContent>Yes, no dark palette is defined.</AccordionContent></AccordionItem>
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
                  <Pagination><PaginationContent><PaginationItem><PaginationPrevious href="#" /></PaginationItem><PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem><PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem><PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem><PaginationItem><PaginationNext href="#" /></PaginationItem></PaginationContent></Pagination>
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
                  <Logo variant="black" width={120} />
                  <div className="rounded-lg p-4" style={{ background: '#09090b' }}><Logo variant="white" width={120} /></div>
                </Block>
              </div>
            </section>

            {/* BLOCKS */}
            <section id="blocks" className="g-section">
              <div className="g-eyebrow">Templates</div><h2>Blocks</h2>
              <p className="g-lede">Pre-composed, auto-themed forms built from the 2one components — ready to drop into an app.</p>
              <div className="g-grid2" style={{ marginTop: 16 }}>
                <Block title="login-03" meta="block" className="col"><div className="w-full max-w-sm mx-auto"><Login03 /></div></Block>
                <Block title="login-01" meta="block" className="col"><div className="w-full max-w-sm mx-auto"><Login01 /></div></Block>
                <Block title="signup-01" meta="block" className="col"><div className="w-full max-w-sm mx-auto"><Signup01 /></div></Block>
              </div>
              <div className="g-block" style={{ marginTop: 18 }}>
                <div className="g-block-head"><h3>dashboard-plain</h3><span className="meta">block · content only, no menu</span></div>
                <div style={{ border: '1px solid var(--g-line)', borderRadius: 14, overflow: 'auto', height: 600, background: '#fff', boxShadow: 'var(--g-shadow)' }}>
                  <DashboardPlain />
                </div>
              </div>
              <div className="g-scale-label">All blocks</div>
              <div className="g-index">
                {['login-01', 'login-02', 'login-03', 'login-04', 'login-05', 'signup-01', 'signup-02', 'dashboard-plain'].map((b) => <a key={b} href="#blocks">{b}</a>)}
              </div>
            </section>

            {/* INDEX */}
            <section id="index" className="g-section">
              <div className="g-eyebrow">Reference</div><h2>All components</h2>
              <p className="g-lede">Every export in the package — 54 shadcn primitives + 3 2one-only.</p>
              <div className="g-index" style={{ marginTop: 16 }}>
                {ALL_COMPONENTS.map((c) => <a key={c} href="#overview">{c}</a>)}
              </div>
            </section>

            <footer className="g-foot">@yokesh-2one/design-library · shadcn/ui re-skinned to the 2one tokens · light-only · rendered live from the real components.</footer>
          </main>
        </div>
      </div>
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

function Swatches({ items, prefix }: { items: [string, string][]; prefix: string }) {
  return (
    <div className="g-swatches">
      {items.map(([k, v]) => (
        <div className="g-sw" key={k}><div className="chip" style={{ background: v }} /><div className="m"><div>{prefix}{k}</div><div className="hx">{v}</div></div></div>
      ))}
    </div>
  )
}
