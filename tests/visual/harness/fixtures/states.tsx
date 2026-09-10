import * as React from 'react'
import { Inbox, AlertTriangle, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'

/*
  The required predictable states (requirement #6), each as a deterministic case
  so a regression in how the system renders "disabled / loading / empty / error /
  success" is caught. Composed from real DLS components.
*/

type Case = { render: () => React.ReactNode; layout?: 'center' | 'fill' }

export const STATE_CASES: Record<string, Case> = {
  'state-disabled': {
    render: () => (
      <div className="flex w-80 flex-col gap-4 opacity-100">
        <div className="flex flex-col gap-2">
          <Label htmlFor="sd-in">Email</Label>
          <Input id="sd-in" defaultValue="ada@example.com" disabled />
        </div>
        <Label className="flex items-center gap-2"><Checkbox disabled /> Remember me</Label>
        <Label className="flex items-center gap-2"><Switch disabled /> Notifications</Label>
        <Button disabled>Continue</Button>
      </div>
    ),
  },
  'state-loading': {
    render: () => (
      <div className="flex w-80 flex-col gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <Skeleton className="h-24 w-full rounded-lg" />
        <Button disabled>
          <Spinner />
          Loading
        </Button>
      </div>
    ),
  },
  'state-empty': {
    render: () => (
      <Empty className="w-96">
        <EmptyHeader>
          <EmptyMedia variant="icon"><Inbox /></EmptyMedia>
          <EmptyTitle>No invoices yet</EmptyTitle>
          <EmptyDescription>Create your first invoice to see it here.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent><Button>New invoice</Button></EmptyContent>
      </Empty>
    ),
  },
  'state-error': {
    render: () => (
      <div className="flex w-96 flex-col gap-4">
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Payment failed</AlertTitle>
          <AlertDescription>Your card was declined. Try another method.</AlertDescription>
        </Alert>
        <FieldGroup>
          <Field data-invalid>
            <FieldLabel htmlFor="se-in">Card number</FieldLabel>
            <Input id="se-in" defaultValue="4242 4242 4242 0000" aria-invalid aria-describedby="se-err" />
            <FieldError id="se-err">This card number is invalid.</FieldError>
          </Field>
        </FieldGroup>
      </div>
    ),
  },
  'state-success': {
    render: () => (
      <Alert className="w-96">
        <CheckCircle2 />
        <AlertTitle>Payment received</AlertTitle>
        <AlertDescription>Your receipt has been emailed to you.</AlertDescription>
      </Alert>
    ),
  },
}
