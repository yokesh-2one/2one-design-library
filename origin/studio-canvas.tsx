import type { ReactNode } from 'react'
import { ArrowRight, Check, Layers, Type } from 'lucide-react'

import { AppBar } from '@/components/app-bar'
import { MediaPlaceholder } from '@/components/media-placeholder'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

export type CanvasKind = 'empty' | 'onepager' | 'prototype' | 'slide'

const FEATURES = [
  {
    icon: Type,
    title: 'One type system',
    body: 'Satoshi for headings, Inter for body. The board uses the same pair as the product.',
  },
  {
    icon: Layers,
    title: 'One component set',
    body: 'The draft is assembled from the library, not a parallel kit.',
  },
  {
    icon: Check,
    title: 'One primary action',
    body: 'The screen keeps a single filled button. Everything else is outline.',
  },
] as const

function Artboard({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-full justify-center bg-muted px-6 py-10 md:px-10 md:py-16">
      <div className="flex w-full max-w-4xl flex-col gap-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Card className="gap-0 overflow-hidden py-0 shadow-sm">{children}</Card>
      </div>
    </div>
  )
}

export function StudioCanvasEmpty() {
  return (
    <Artboard label="Frame 1 · Desktop">
      <Empty className="min-h-[32rem] rounded-none border-0">
        <EmptyHeader>
          <EmptyTitle>Empty board</EmptyTitle>
          <EmptyDescription>
            Describe a one-pager, a prototype screen, or a slide in the chat.
            The draft appears on this frame. This replica does not call Claude.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </Artboard>
  )
}

export function StudioCanvasOnePager({
  heading,
  onEditHeading,
}: {
  heading: string
  onEditHeading?: () => void
}) {
  return (
    <Artboard label="Frame 1 · One-pager · 1280">
      <div className="bg-background">
        <div className="flex flex-col gap-8 px-8 py-16 md:px-12 md:py-20">
          <div className="flex max-w-xl flex-col items-start gap-6">
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">
              {onEditHeading ? (
                <button
                  type="button"
                  className="rounded-md text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  onClick={onEditHeading}
                >
                  {heading}
                </button>
              ) : (
                heading
              )}
            </h1>
            <p className="text-lg text-muted-foreground text-pretty">
              A first pass on the board: headline, proof points, and one action.
              Refine from chat, comments, or the heading in select mode.
            </p>
            <Button size="lg">
              Get started <ArrowRight />
            </Button>
          </div>
          <MediaPlaceholder label="Hero visual slot" />
        </div>
        <Separator />
        <div className="grid gap-8 px-8 py-12 md:grid-cols-3 md:px-12">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col gap-3">
              <p className="flex items-center gap-2 text-sm font-medium">
                <f.icon className="size-4 text-muted-foreground" aria-hidden />
                {f.title}
              </p>
              <p className="text-sm text-muted-foreground text-pretty">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Artboard>
  )
}

export function StudioCanvasPrototype() {
  return (
    <Artboard label="Frame 1 · Prototype · 390">
      <div className="mx-auto w-full max-w-sm bg-background">
        <AppBar title="Invite a teammate" onBack={() => undefined} />
        <div className="flex flex-col gap-6 p-6">
          <p className="text-sm text-muted-foreground text-pretty">
            A single product screen on the board, not an app shell with a data
            table. This form does not send email.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="studio-invite-email">Work email</FieldLabel>
                <Input
                  id="studio-invite-email"
                  name="email"
                  type="email"
                  autoComplete="off"
                />
              </Field>
              <Button type="submit">Send invite</Button>
            </FieldGroup>
          </form>
        </div>
      </div>
    </Artboard>
  )
}

export function StudioCanvasSlide() {
  return (
    <Artboard label="Frame 1 · Slide · 16:9">
      <div className="flex aspect-video flex-col justify-center gap-8 bg-background px-12 py-10 md:px-16">
        <p className="text-sm text-muted-foreground">01 / Outline</p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance md:text-5xl">
          Keep the brand in one place
        </h1>
        <ul className="max-w-xl list-disc space-y-3 pl-5 text-lg text-muted-foreground">
          <li>The board holds a draft, not a live product.</li>
          <li>Chat changes the frame. Comments mark a spot.</li>
          <li>Export on this replica does not write a file.</li>
        </ul>
      </div>
    </Artboard>
  )
}

export function StudioCanvasStage({
  kind,
  heading,
  onEditHeading,
}: {
  kind: CanvasKind
  heading: string
  onEditHeading?: () => void
}) {
  if (kind === 'onepager') {
    return (
      <StudioCanvasOnePager heading={heading} onEditHeading={onEditHeading} />
    )
  }
  if (kind === 'prototype') return <StudioCanvasPrototype />
  if (kind === 'slide') return <StudioCanvasSlide />
  return <StudioCanvasEmpty />
}
