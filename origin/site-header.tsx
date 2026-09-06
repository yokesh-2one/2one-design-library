import { Menu } from 'lucide-react'

import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import { ThemeToggle } from '@/components/theme-toggle'
import { LINKS, ROUTES, type RouteId } from './nav'

export function SiteHeader({ current }: { current: RouteId }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        <a
          href="/"
          className="flex items-center rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="2one home"
        >
          <Logo variant="black" width={64} className="dark:hidden" />
          <Logo variant="white" width={64} className="hidden dark:block" />
        </a>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {ROUTES.map((r) => (
            <a
              key={r.id}
              href={r.href}
              aria-current={current === r.id ? 'page' : undefined}
              className={
                current === r.id
                  ? 'rounded-md px-3 py-2 text-sm font-medium text-foreground underline-offset-4'
                  : 'rounded-md px-3 py-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline'
              }
            >
              {r.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Button asChild variant="outline" className="hidden md:inline-flex">
            <a href={LINKS.contact.href}>{LINKS.contact.label}</a>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label="Primary">
                <a
                  href="/"
                  aria-current={current === 'home' ? 'page' : undefined}
                  className={
                    current === 'home'
                      ? 'rounded-md bg-muted px-3 py-2 text-sm font-medium'
                      : 'rounded-md px-3 py-2 text-sm text-muted-foreground'
                  }
                >
                  Home
                </a>
                {ROUTES.map((r) => (
                  <a
                    key={r.id}
                    href={r.href}
                    aria-current={current === r.id ? 'page' : undefined}
                    className={
                      current === r.id
                        ? 'rounded-md bg-muted px-3 py-2 text-sm font-medium'
                        : 'rounded-md px-3 py-2 text-sm text-muted-foreground'
                    }
                  >
                    {r.label}
                  </a>
                ))}
                <a href={LINKS.contact.href} className="rounded-md px-3 py-2 text-sm text-muted-foreground">
                  {LINKS.contact.label}
                </a>
              </nav>
              <div className="px-4">
                <ThemeToggle />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
