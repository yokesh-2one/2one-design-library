import * as React from 'react'

import { cn } from '@/lib/utils'

/*
  BottomNavItem — one destination in a bottom navigation (Figma 265:1453).
  No shadcn equivalent. Icon + label, repeated in a row to form the tab bar.
  Only one selected at a time (the bar enforces this). Icon swappable.
*/
export interface BottomNavItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  label: string
  selected?: boolean
}

export function BottomNavItem({ icon, label, selected = false, className, ...props }: BottomNavItemProps) {
  return (
    <button
      type="button"
      data-slot="bottom-nav-item"
      aria-current={selected ? 'page' : undefined}
      className={cn(
        'flex flex-1 flex-col items-center gap-1 px-2 py-2 active:bg-accent',
        selected ? 'text-foreground' : 'text-muted-foreground',
        className,
      )}
      {...props}
    >
      <span className="flex size-6 items-center justify-center">{icon}</span>
      <span className="text-xs">{label}</span>
    </button>
  )
}
