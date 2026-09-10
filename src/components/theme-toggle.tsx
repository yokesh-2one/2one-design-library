'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

/*
  ThemeToggle — the light/dark switch for site and app chrome (2one-authored; no
  shadcn equivalent). Wraps next-themes (the same provider the exported
  ThemeProvider configures), so it swaps the audited light/dark token set — never a
  third palette.

  Accessibility + no-hydration-flip: both icons are always rendered and the visible
  one is chosen by CSS from the `.dark` class (Sun in light, Moon in dark), so the
  server and client markup match. The button is icon-only, so it carries an
  aria-label; aria-pressed reflects the active theme once mounted.
*/
export type ThemeToggleProps = React.ComponentProps<typeof Button>

export function ThemeToggle({ className, ...props }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Switch theme"
      aria-pressed={mounted ? isDark : undefined}
      title="Switch theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={className}
      {...props}
    >
      <Sun className="dark:hidden" aria-hidden />
      <Moon className="hidden dark:block" aria-hidden />
    </Button>
  )
}
