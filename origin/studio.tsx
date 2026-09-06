import * as React from 'react'
import { ArrowUp, MessageSquare, MousePointer2, Share } from 'lucide-react'
import { toast } from 'sonner'

import { Logo } from '@/components/logo'
import { useIsMobile } from '@/hooks/use-mobile'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { ThemeToggle } from './theme-toggle'
import {
  StudioCanvasStage,
  type CanvasKind,
} from './studio-canvas'

type Role = 'assistant' | 'user'

type ChatMessage = {
  id: string
  role: Role
  text: string
}

type Pin = {
  id: string
  x: number
  y: number
  text: string
}

const OPENING: ChatMessage = {
  id: 'm0',
  role: 'assistant',
  text: 'Chat on the left, a board on the right. Tell me what to put on the frame: a one-pager, a prototype screen, or a slide. This replica is 2one components in this tab. It does not call Anthropic.',
}

function decideCanvas(text: string, current: CanvasKind): CanvasKind {
  const q = text.toLowerCase()
  if (/\b(slide|deck|pitch|presentation)\b/.test(q)) return 'slide'
  if (/\b(prototype|app screen|onboarding|invite|settings)\b/.test(q)) {
    return 'prototype'
  }
  if (/\b(one-pager|one pager|landing|hero|marketing|page|poster)\b/.test(q)) {
    return 'onepager'
  }
  if (current === 'empty') return 'onepager'
  return current
}

function replyFor(kind: CanvasKind, changed: boolean): string {
  if (!changed) {
    return 'Same frame. Ask for a one-pager, a prototype, or a slide to swap it. Comment mode pins a note on the board.'
  }
  if (kind === 'slide') {
    return 'The board now holds one slide. Whitespace is the point: a title and three lines, not an application.'
  }
  if (kind === 'prototype') {
    return 'The board now holds one product screen in a phone-width frame. Mark it up with comments, or ask for a one-pager or a slide instead.'
  }
  return 'The board now holds a one-pager on a desktop frame. Select mode lets you rewrite the heading.'
}

export function StudioPage() {
  const isMobile = useIsMobile()
  const [messages, setMessages] = React.useState<ChatMessage[]>([OPENING])
  const [draft, setDraft] = React.useState('')
  const [kind, setKind] = React.useState<CanvasKind>('empty')
  const [commentMode, setCommentMode] = React.useState(false)
  const [selectMode, setSelectMode] = React.useState(false)
  const [pins, setPins] = React.useState<Pin[]>([])
  const [heading, setHeading] = React.useState('Your idea, on the board')
  const [headingDraft, setHeadingDraft] = React.useState(heading)
  const [editOpen, setEditOpen] = React.useState(false)
  const endRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    const nextKind = decideCanvas(text, kind)
    const changed = nextKind !== kind
    setDraft('')
    setMessages((m) => [
      ...m,
      { id: `u-${m.length}`, role: 'user', text },
      {
        id: `a-${m.length}`,
        role: 'assistant',
        text: replyFor(nextKind, changed),
      },
    ])
    setKind(nextKind)
  }

  const addPin = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!commentMode || kind === 'empty') return
    const t = e.target as HTMLElement
    if (t.closest('[data-pin]')) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPins((p) => [
      ...p,
      {
        id: `p-${p.length + 1}`,
        x,
        y,
        text: 'Note this region.',
      },
    ])
  }

  const chat = (
    <div className="flex h-full min-h-0 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              <Avatar size="sm">
                <AvatarFallback>
                  {msg.role === 'user' ? 'You' : '2o'}
                </AvatarFallback>
              </Avatar>
              <p className="pt-0.5 text-sm text-pretty">{msg.text}</p>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </ScrollArea>
      <Separator />
      <form className="flex flex-col gap-3 p-4" onSubmit={send}>
        <Field>
          <FieldLabel htmlFor="studio-draft">Message</FieldLabel>
          <Textarea
            id="studio-draft"
            name="message"
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                e.currentTarget.form?.requestSubmit()
              }
            }}
            placeholder="A one-pager for the product launch"
          />
        </Field>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            <Kbd>Enter</Kbd> sends. Shift + Enter for a new line.
          </p>
          <Button type="submit">
            Send <ArrowUp />
          </Button>
        </div>
      </form>
    </div>
  )

  const stage = (
    <div className="relative h-full min-h-0 overflow-auto bg-muted">
      {commentMode ? (
        <p className="pointer-events-none absolute top-4 left-4 z-10 text-xs text-muted-foreground">
          Click the board to pin a note.
        </p>
      ) : null}
      {selectMode && kind === 'onepager' ? (
        <p className="pointer-events-none absolute top-4 right-4 z-10 text-xs text-muted-foreground">
          Click the heading to edit it.
        </p>
      ) : null}
      <div className="relative min-h-full" onClick={addPin}>
          <StudioCanvasStage
            kind={kind}
            heading={heading}
            onEditHeading={
              selectMode && kind === 'onepager'
                ? () => {
                    setHeadingDraft(heading)
                    setEditOpen(true)
                  }
                : undefined
            }
          />
          {pins.map((pin, i) => (
            <Popover key={pin.id}>
              <PopoverTrigger asChild>
                <button
                  data-pin
                  type="button"
                  className="absolute z-10 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-xs font-medium shadow-xs focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  aria-label={`Canvas note ${i + 1}`}
                >
                  {i + 1}
                </button>
              </PopoverTrigger>
              <PopoverContent>
                <p className="text-sm">{pin.text}</p>
              </PopoverContent>
            </Popover>
          ))}
      </div>
    </div>
  )

  return (
    <div className="flex h-svh flex-col bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <a
          href="/"
          className="flex items-center rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Origin home"
        >
          <Logo variant="black" width={46} className="dark:hidden" />
          <Logo variant="white" width={46} className="hidden dark:block" />
        </a>
        <Separator orientation="vertical" className="h-6" />
        <p className="font-heading text-base font-bold">Design studio</p>
        <Badge variant="outline">Replica</Badge>
        <span className="flex-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Toggle
                pressed={commentMode}
                onPressedChange={(v) => {
                  setCommentMode(v)
                  if (v) setSelectMode(false)
                }}
                aria-label="Comment mode"
                size="sm"
              >
                <MessageSquare />
              </Toggle>
            </span>
          </TooltipTrigger>
          <TooltipContent>Pin notes on the canvas</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Toggle
                pressed={selectMode}
                onPressedChange={(v) => {
                  setSelectMode(v)
                  if (v) setCommentMode(false)
                }}
                aria-label="Select mode"
                size="sm"
              >
                <MousePointer2 />
              </Toggle>
            </span>
          </TooltipTrigger>
          <TooltipContent>Edit the heading on the board</TooltipContent>
        </Tooltip>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() =>
                toast('Export is not wired. This replica does not write files.')
              }
            >
              HTML bundle
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                toast('Export is not wired. This replica does not write files.')
              }
            >
              PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                toast('Export is not wired. This replica does not write files.')
              }
            >
              PowerPoint
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            toast('Sharing is not wired. This replica stays on this machine.')
          }
        >
          <Share />
          Share
        </Button>
      </header>

      {isMobile ? (
        <Tabs defaultValue="chat" className="flex min-h-0 flex-1 flex-col">
          <div className="border-b px-4 py-2">
            <TabsList>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="canvas">Canvas</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="chat" className="min-h-0 overflow-hidden">
            {chat}
          </TabsContent>
          <TabsContent value="canvas" className="min-h-0 overflow-hidden">
            {stage}
          </TabsContent>
        </Tabs>
      ) : (
        <ResizablePanelGroup direction="horizontal" className="min-h-0 flex-1">
          <ResizablePanel defaultSize={28} minSize={22}>
            {chat}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={72} minSize={40}>
            {stage}
          </ResizablePanel>
        </ResizablePanelGroup>
      )}

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit heading</SheetTitle>
            <SheetDescription>
              Local text only. The change stays in this tab.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4">
            <Field>
              <FieldLabel htmlFor="studio-heading">Heading</FieldLabel>
              <Input
                id="studio-heading"
                value={headingDraft}
                onChange={(e) => setHeadingDraft(e.target.value)}
              />
            </Field>
          </div>
          <SheetFooter>
            <Button
              onClick={() => {
                setHeading(headingDraft.trim() || heading)
                setEditOpen(false)
              }}
            >
              Apply
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
