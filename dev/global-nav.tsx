/*
  The ONE global navigation, shown as a horizontal menu in the TOP HEADER of
  every page (matching the Knowledge-graph page). The sidebar is then scoped to
  the current page's own sections — e.g. Overview's sidebar shows only its
  in-page anchors, Components' shows the component tiers.

  Top-level destinations are flat links; educational + support links live under
  a "Help" menu (What is a DLS?, FAQ, Support). Labels are keyed into i18n so
  the menu is bilingual like the rest of the showcase; the hrefs stay fixed.
*/
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const GLOBAL_NAV: [string, string][] = [
  ['/', 'nav.overview'],
  ['/components.html', 'nav.components'],
  ['/studio.html', 'nav.studio'],
  ['/graph.html', 'nav.graph'],
]

// Grouped under the Help menu. FAQ/Support are sections on the Overview page,
// so `/#faq` and `/#support` load Overview and scroll there from any page.
export const HELP_NAV: [string, string][] = [
  ['/dls.html', 'nav.dls'],
  ['/#faq', 'overview.sidebar.faq'],
  ['/#support', 'overview.sidebar.support'],
  ['/changelog.html', 'nav.changelog'],
]

const linkClass = (active: boolean) =>
  'whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ' +
  (active
    ? 'bg-accent font-medium text-foreground'
    : 'text-muted-foreground hover:bg-accent hover:text-foreground')

export function TopNav({ current }: { current: string }) {
  const { t } = useTranslation()
  // What is a DLS? now lives under Help, so Help reads as the active section there.
  const helpActive = HELP_NAV.some(([href]) => href === current)
  // The label of wherever we are now — shown on the compact mobile trigger so the
  // menu communicates the current destination without a scroll.
  const currentLabel = [...GLOBAL_NAV, ...HELP_NAV].find(([href]) => href === current)?.[1] ?? GLOBAL_NAV[0][1]
  return (
    <nav aria-label="Primary" className="flex min-w-0 items-center">
      {/* Tablet / desktop: the flat horizontal menu (fits — no scroll). */}
      <div className="hidden items-center gap-0.5 sm:flex">
        {GLOBAL_NAV.map(([href, key]) => {
          const active = current === href
          return (
            <a
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={linkClass(active)}
            >
              {t(key)}
            </a>
          )
        })}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-current={helpActive ? 'page' : undefined}
            className={linkClass(helpActive) + ' inline-flex items-center gap-1'}
          >
            {t('common.help')}
            <ChevronDown className="size-3.5" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {HELP_NAV.map(([href, key]) => (
              <DropdownMenuItem key={href} asChild>
                <a href={href}>{t(key)}</a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile: one compact menu instead of a horizontal scroll. Shows the
          current destination; opens the full list (destinations + Help) as a
          vertical menu with real tap targets. */}
      <DropdownMenu>
        <DropdownMenuTrigger className={linkClass(true) + ' inline-flex items-center gap-1 sm:hidden'}>
          {t(currentLabel)}
          <ChevronDown className="size-3.5" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {GLOBAL_NAV.map(([href, key]) => (
            <DropdownMenuItem key={href} asChild>
              <a href={href} aria-current={current === href ? 'page' : undefined}>{t(key)}</a>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          {HELP_NAV.map(([href, key]) => (
            <DropdownMenuItem key={href} asChild>
              <a href={href} aria-current={current === href ? 'page' : undefined}>{t(key)}</a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
}
