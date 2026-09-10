import {
  Mic,
  MicOff,
  Video,
  MonitorUp,
  Users,
  MessageSquare,
  PhoneOff,
  Circle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MediaPlaceholder } from '@/components/media-placeholder'
import { Toolbar, ToolbarSpacer } from '@/components/ui/toolbar'

/*
  Representative video-meeting screen — a TEST FIXTURE, not a shipped pattern.
  Composed only from real DLS components (MediaPlaceholder tiles, Toolbar control
  bar, Button, Avatar, Badge) to exercise a dense, image-first, full-bleed layout
  under visual + a11y testing. Deterministic: fixed participants, fixed elapsed
  time, no images (MediaPlaceholder is the sanctioned "no media yet" surface).

  Rules honoured: grayscale + one accent, lucide-only, icon controls carry
  aria-labels, the destructive "Leave" stays reachable, no primary fill in the
  control bar so nothing competes for the one-primary slot.
*/

const PARTICIPANTS = [
  { name: 'Amara Okafor', initials: 'AO', muted: false },
  { name: 'Bjorn Lund', initials: 'BL', muted: true },
  { name: 'Chen Wei', initials: 'CW', muted: false },
  { name: 'Dara Singh', initials: 'DS', muted: true },
]

export function MeetingScreen() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      {/* Meeting header — title, recording status, participant count */}
      <header className="flex shrink-0 items-center gap-3 border-b px-4 py-3">
        <span className="font-heading text-base font-bold">Design system weekly</span>
        <Badge variant="outline" className="gap-1.5">
          <Circle className="size-2 fill-current text-danger" aria-hidden />
          Recording
        </Badge>
        <span className="ml-auto text-sm tabular-nums text-muted-foreground">24:31</span>
        <Badge variant="secondary" className="gap-1.5">
          <Users className="size-3.5" aria-hidden />4
        </Badge>
      </header>

      {/* Video grid. The region scrolls, so it is focusable + labelled for
          keyboard users (axe: scrollable-region-focusable). */}
      <main
        aria-label="Participant videos"
        tabIndex={0}
        className="min-h-0 flex-1 overflow-y-auto p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="grid h-full grid-cols-1 gap-3 sm:grid-cols-2">
          {PARTICIPANTS.map((p) => (
            <div key={p.name} className="relative">
              <MediaPlaceholder ratio={16 / 9} icon={<Video />} label={`${p.name}'s camera`} />
              <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-md bg-background/80 px-2 py-1 backdrop-blur">
                <Avatar className="size-6">
                  <AvatarFallback className="text-[10px]">{p.initials}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{p.name}</span>
                {p.muted ? (
                  <MicOff className="size-3.5 text-muted-foreground" aria-label="Muted" />
                ) : (
                  <Mic className="size-3.5 text-muted-foreground" aria-label="Unmuted" />
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Control bar — icon actions + the destructive Leave, which must stay
          visible even at mobile width (see a11y.spec.ts). */}
      <footer className="shrink-0 border-t p-3">
        <Toolbar className="flex-wrap justify-center gap-2">
          <Button variant="outline" size="icon" aria-label="Mute microphone">
            <Mic />
          </Button>
          <Button variant="outline" size="icon" aria-label="Stop camera">
            <Video />
          </Button>
          <Button variant="outline" size="icon" aria-label="Share screen">
            <MonitorUp />
          </Button>
          <Button variant="outline" size="icon" aria-label="Show participants">
            <Users />
          </Button>
          <Button variant="outline" size="icon" aria-label="Open chat">
            <MessageSquare />
          </Button>
          <ToolbarSpacer />
          <Button variant="destructive" data-testid="leave-call">
            <PhoneOff />
            Leave
          </Button>
        </Toolbar>
      </footer>
    </div>
  )
}
