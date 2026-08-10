import { createRoot } from 'react-dom/client'
import './theme-dev.css'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Rocket } from 'lucide-react'

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '20px 0', borderTop: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted-foreground)', margin: 0, fontFamily: 'var(--font-sans)' }}>{title}</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>{children}</div>
    </section>
  )
}

function App() {
  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 24px 120px' }}>
      <h1 style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-.02em', margin: 0 }}>2one Design Language System</h1>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 17, marginTop: 8 }}>
        shadcn/ui components, re-skinned to the 2one tokens. Grayscale · pill buttons · Satoshi headings · Inter body · light-only.
      </p>

      <Row title="Button — pill, monochrome">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button disabled>Disabled</Button>
        <Button><Rocket /> With icon</Button>
      </Row>

      <Row title="Inputs">
        <div style={{ display: 'grid', gap: 6, width: 240 }}>
          <Label htmlFor="e">Email</Label>
          <Input id="e" placeholder="you@example.com" />
        </div>
        <div style={{ display: 'grid', gap: 6, width: 240 }}>
          <Label htmlFor="p">Password</Label>
          <Input id="p" type="password" aria-invalid defaultValue="123" />
        </div>
        <Select>
          <SelectTrigger style={{ width: 200 }}><SelectValue placeholder="Country" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="in">India</SelectItem>
            <SelectItem value="us">United States</SelectItem>
            <SelectItem value="de">Germany</SelectItem>
          </SelectContent>
        </Select>
      </Row>

      <Row title="Selection controls">
        <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><Checkbox defaultChecked /> Remember me</label>
        <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><Checkbox /> Subscribe</label>
        <Switch defaultChecked />
        <RadioGroup defaultValue="a" style={{ display: 'flex', gap: 16 }}>
          <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><RadioGroupItem value="a" /> Standard</label>
          <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><RadioGroupItem value="b" /> Express</label>
        </RadioGroup>
      </Row>

      <Row title="Badges">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </Row>

      <Row title="Tabs">
        <Tabs defaultValue="one" style={{ width: 360 }}>
          <TabsList>
            <TabsTrigger value="one">Overview</TabsTrigger>
            <TabsTrigger value="two">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="one" style={{ fontSize: 14, color: 'var(--muted-foreground)', paddingTop: 8 }}>Overview panel.</TabsContent>
          <TabsContent value="two" style={{ fontSize: 14, color: 'var(--muted-foreground)', paddingTop: 8 }}>Details panel.</TabsContent>
        </Tabs>
      </Row>

      <Row title="Card">
        <Card style={{ width: 320 }}>
          <CardHeader>
            <CardTitle>Upgrade to Pro</CardTitle>
            <CardDescription>Unlock every component.</CardDescription>
          </CardHeader>
          <CardContent style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>Grayscale, token-driven, ready to ship.</CardContent>
          <CardFooter><Button>Continue</Button></CardFooter>
        </Card>
      </Row>

      <Row title="Feedback">
        <Alert style={{ maxWidth: 420 }}>
          <Rocket />
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>This is the 2one-themed alert.</AlertDescription>
        </Alert>
      </Row>

      <Row title="Ranges">
        <div style={{ width: 260 }}><Progress value={62} /></div>
        <div style={{ width: 260 }}><Slider defaultValue={[40]} max={100} step={1} /></div>
      </Row>

      <Separator style={{ margin: '32px 0' }} />

      <Row title="Foundations — type scale (Satoshi)">
        <div>
          <p className="font-heading text-h1 font-bold">Display</p>
          <p className="font-heading text-h3 font-bold">Heading 3</p>
          <p className="font-heading text-h5 font-bold">Heading 5</p>
          <p className="text-base">Body — Inter, the quick brown fox.</p>
          <p className="text-sm text-muted-foreground">Small — supporting copy.</p>
        </div>
      </Row>

      <Row title="Foundations — colour ramps">
        <div style={{ display: 'flex', gap: 4 }}>
          {['bg-neutral-50', 'bg-neutral-200', 'bg-neutral-400', 'bg-neutral-600', 'bg-neutral-700', 'bg-neutral-950'].map((c) => (
            <span key={c} className={`${c} size-9 rounded-sm border`} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <span className="bg-accent-800 size-9 rounded-sm" />
          <span className="bg-danger-600 size-9 rounded-sm" />
          <span className="bg-success-600 size-9 rounded-sm" />
        </div>
      </Row>

      <Row title="Foundations — radius scale">
        {['rounded-xs', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-full'].map((r) => (
          <span key={r} className={`${r} size-12 bg-secondary border grid place-items-center text-[10px] text-muted-foreground`}>{r.replace('rounded-', '')}</span>
        ))}
      </Row>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
