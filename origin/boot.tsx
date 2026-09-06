import type { ComponentType } from 'react'
import { createRoot } from 'react-dom/client'

import { ThemeProvider } from '../src/theme-provider'

import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'
import type { RouteId } from './nav'
import './site.css'

export function mount(Page: ComponentType, route: RouteId) {
  const el = document.getElementById('root')
  if (!el) throw new Error('Origin: #root is missing')
  createRoot(el).render(
    <ThemeProvider>
      <div className="flex min-h-svh flex-col bg-background text-foreground">
        <SiteHeader current={route} />
        <Page />
        <SiteFooter />
      </div>
    </ThemeProvider>,
  )
}
