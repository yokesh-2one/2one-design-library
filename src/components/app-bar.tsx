import * as React from 'react'
import { ChevronLeft } from 'lucide-react'

import { cn } from '@/lib/utils'

/*
  AppBar — mobile top navigation bar (Figma 160:417). No shadcn equivalent.
  Fixed 64px height, full width.

  Two shapes:
  • Default — a short, centred title with a back button leading and at most one
    trailing action (the original screen-level bar).
  • Branded — pass `brand` (typically <Logo width={46} />) to give the wordmark a
    first-class home in product chrome. The brand sits at the leading edge, the
    title reads as the section beside it, and the trailing action stays on the
    right. Use this as the app's top-level bar; use the default for a pushed
    screen where a back button and a centred title are what you want.
*/
export interface AppBarProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  /** Brand mark for the leading edge — typically <Logo width={46} />. When set,
   *  the bar switches to its branded shape (brand leading, title beside it). */
  brand?: React.ReactNode
  onBack?: () => void
  trailingSlot?: React.ReactNode
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      aria-label="Back"
      className="flex items-center justify-center rounded-lg p-2 text-foreground transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 active:bg-accent/80 disabled:pointer-events-none disabled:opacity-50"
    >
      <ChevronLeft className="size-[18px]" />
    </button>
  )
}

export function AppBar({ title, brand, onBack, trailingSlot, className, ...props }: AppBarProps) {
  if (brand) {
    return (
      <div
        data-slot="app-bar"
        className={cn('flex h-16 w-full items-center gap-3 border-b px-4', className)}
        {...props}
      >
        {onBack && <BackButton onBack={onBack} />}
        <span className="flex shrink-0 items-center">{brand}</span>
        <p className="min-w-0 truncate font-heading text-lg font-bold text-foreground">{title}</p>
        <div className="ml-auto flex items-center">{trailingSlot}</div>
      </div>
    )
  }

  return (
    <div
      data-slot="app-bar"
      className={cn('flex h-16 w-full items-center justify-between border-b px-5', className)}
      {...props}
    >
      <div className="flex w-8 items-center">{onBack && <BackButton onBack={onBack} />}</div>
      <p className="font-heading text-xl font-bold text-foreground">{title}</p>
      <div className="flex w-8 items-center justify-end">{trailingSlot}</div>
    </div>
  )
}
