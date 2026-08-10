import * as React from 'react'
import { ChevronLeft } from 'lucide-react'

import { cn } from '@/lib/utils'

/*
  AppBar — mobile top navigation bar (Figma 160:417). No shadcn equivalent.
  Fixed 64px height, full width, centered short title. Leading slot = back/menu
  only; max one trailing action; title never blank.
*/
export interface AppBarProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  onBack?: () => void
  trailingSlot?: React.ReactNode
}

export function AppBar({ title, onBack, trailingSlot, className, ...props }: AppBarProps) {
  return (
    <div
      data-slot="app-bar"
      className={cn('flex h-16 w-full items-center justify-between border-b px-5', className)}
      {...props}
    >
      <div className="flex w-8 items-center">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="flex items-center justify-center rounded-lg p-2 text-foreground hover:bg-accent"
          >
            <ChevronLeft className="size-[18px]" />
          </button>
        )}
      </div>
      <p className="font-heading text-xl font-bold text-foreground">{title}</p>
      <div className="flex w-8 items-center justify-end">{trailingSlot}</div>
    </div>
  )
}
