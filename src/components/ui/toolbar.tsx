import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Toolbar — a horizontal container for actions (a control bar, a card's action row).
 *
 * It **wraps** (`flex-wrap`) by default and deliberately never uses
 * `overflow-x-auto`: critical actions must never be hidden behind a horizontal
 * scroll. When space runs out, items flow onto the next line so a Leave / Close /
 * Submit button always stays visible — at every width. (A hand-rolled control bar
 * that clipped its Leave button at narrow widths is exactly what this prevents.)
 *
 *   <Toolbar>
 *     <Button variant="outline">Mute</Button>
 *     <ToolbarSpacer />
 *     <Button variant="destructive">Leave</Button>
 *   </Toolbar>
 */
function Toolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toolbar"
      role="toolbar"
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  )
}

/**
 * ToolbarSpacer — pushes the actions after it to the far end when there is room,
 * and simply collapses when the toolbar wraps. Never introduces a scroll.
 */
function ToolbarSpacer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toolbar-spacer"
      aria-hidden
      className={cn("flex-1", className)}
      {...props}
    />
  )
}

export { Toolbar, ToolbarSpacer }
