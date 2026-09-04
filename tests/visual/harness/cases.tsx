import * as React from 'react'
import { Home, Search, Bell, User, Check, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AppShell } from '@/patterns/app-shell'
import { MeetingScreen } from './fixtures/meeting-screen'
import { COMPONENT_CASES } from './fixtures/components'
import { BLOCK_CASES } from './fixtures/blocks'
import { STATE_CASES } from './fixtures/states'
import { ALL_CASES } from '../support/harness'

export interface HarnessCase {
  /** Rendered node. `params` carries the URL query (e.g. ?open=1). */
  render: (params: URLSearchParams) => React.ReactNode
  /** 'center' pads and centres the case; 'fill' gives it the full viewport. */
  layout?: 'center' | 'fill'
}

/* Deterministic, on-brand examples of the required states (loading, empty,
   error, selected, disabled) — no dates, no randomness, no network. */

function ButtonCase() {
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button>Primary action</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Delete</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled>Disabled</Button>
        <Button variant="outline" disabled>
          <Spinner />
          Loading
        </Button>
        <Button variant="outline">
          <Plus />
          With icon
        </Button>
        <Button size="sm" variant="outline">
          Small
        </Button>
        <Button size="lg" variant="outline">
          Large
        </Button>
      </div>
    </div>
  )
}

function CardCase() {
  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Team plan</CardTitle>
        <CardDescription>Everything a small product team needs to ship.</CardDescription>
        <CardAction>
          <Badge variant="secondary">Popular</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <ul className="flex flex-col gap-2">
          <li className="flex items-center gap-2">
            <Check className="size-4" aria-hidden />
            Unlimited projects
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-4" aria-hidden />
            Audited accessibility
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-4" aria-hidden />
            Priority support
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Choose Team</Button>
      </CardFooter>
    </Card>
  )
}

function DialogCase({ open }: { open: boolean }) {
  return (
    <Dialog defaultOpen={open}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="dialog-trigger">
          Delete project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this project?</DialogTitle>
          <DialogDescription>
            This permanently removes the project and its history. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" data-testid="dialog-cancel">
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AppShellCase() {
  const destinations = [
    { id: 'home', label: 'Home', icon: <Home /> },
    { id: 'search', label: 'Search', icon: <Search /> },
    { id: 'alerts', label: 'Alerts', icon: <Bell /> },
    { id: 'profile', label: 'Profile', icon: <User /> },
  ]
  return (
    <AppShell title="Acme" destinations={destinations} activeId="home">
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-xl font-bold">Good morning</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          A stable content region so the shell chrome — sidebar on desktop, app bar +
          bottom nav on mobile — is what the screenshot captures.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Active projects</CardTitle>
              <CardDescription>12 in progress</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Open reviews</CardTitle>
              <CardDescription>3 awaiting you</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}

// A table with more columns than a phone is wide, so its container scrolls
// horizontally on the mobile project. This is the regression guard for the
// keyboard-access fix in components/ui/table.tsx (axe: scrollable-region-focusable).
const TABLE_ROWS = [
  { id: 'INV-1001', client: 'Northwind Traders', owner: 'A. Okafor', status: 'Paid', due: 'Jan 12', amount: '$3,200.00' },
  { id: 'INV-1002', client: 'Contoso Ltd', owner: 'B. Lund', status: 'Pending', due: 'Jan 18', amount: '$1,540.00' },
  { id: 'INV-1003', client: 'Fabrikam Inc', owner: 'C. Wei', status: 'Overdue', due: 'Jan 05', amount: '$920.50' },
]

function TableCase() {
  return (
    <div className="w-full max-w-3xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {TABLE_ROWS.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium tabular-nums">{r.id}</TableCell>
              <TableCell>{r.client}</TableCell>
              <TableCell>{r.owner}</TableCell>
              <TableCell>{r.status}</TableCell>
              <TableCell className="tabular-nums">{r.due}</TableCell>
              <TableCell className="text-right tabular-nums">{r.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export const CASES: Record<string, HarnessCase> = {
  button: { render: () => <ButtonCase />, layout: 'center' },
  card: { render: () => <CardCase />, layout: 'center' },
  dialog: { render: (p) => <DialogCase open={p.get('open') === '1'} />, layout: 'center' },
  table: { render: () => <TableCase />, layout: 'center' },
  'app-shell': { render: () => <AppShellCase />, layout: 'fill' },
  meeting: { render: () => <MeetingScreen />, layout: 'fill' },

  // One deterministic case per component (gallery).
  ...COMPONENT_CASES,
  // Full-page blocks + the required predictable states.
  ...BLOCK_CASES,
  ...STATE_CASES,
}

// Guard: every id the specs iterate must have a render here (and vice-versa),
// so the string list in support/harness.ts can never silently drift.
if (import.meta.env?.DEV) {
  const missing = ALL_CASES.filter((id) => !(id in CASES))
  const extra = Object.keys(CASES).filter((id) => !(ALL_CASES as readonly string[]).includes(id))
  if (missing.length || extra.length) {
    // eslint-disable-next-line no-console
    console.error('[harness] case list drift — missing:', missing, 'extra:', extra)
  }
}
