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
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700 }}>Satoshi heading specimen — Two one</p>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16 }}>Inter body specimen — the quick brown fox jumps over the lazy dog.</p>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
