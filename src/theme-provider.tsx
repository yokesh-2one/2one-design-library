'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

/**
 * 2one theme provider — a thin wrapper over next-themes.
 *
 * Adds a `.dark` class to the document root so the audited dark palette in
 * `globals.css` activates (and the shadcn `dark:` utilities with it). The
 * grayscale identity is unchanged — this only swaps the light/dark token set,
 * there is no brand/accent hue. Default is `light` (the 2one default); pass
 * `enableSystem` or `defaultTheme` to change that.
 *
 *   import { ThemeProvider } from '@2one/design-library'
 *   <ThemeProvider><App /></ThemeProvider>
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
