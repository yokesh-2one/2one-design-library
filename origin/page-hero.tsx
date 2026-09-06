import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'

export function PageHero({
  eyebrow,
  title,
  body,
  primary,
  secondary,
  children,
}: {
  eyebrow?: string
  title: string
  body: ReactNode
  primary?: { href: string; label: string; icon?: ReactNode }
  secondary?: { href: string; label: string }
  children: ReactNode
}) {
  return (
    <section className="w-full border-b bg-background">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div className="flex flex-col items-start gap-6">
          {eyebrow ? (
            <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">{eyebrow}</p>
          ) : null}
          <h1 className="max-w-xl text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl">
            {title}
          </h1>
          <div className="max-w-md text-lg text-muted-foreground text-pretty">{body}</div>
          {(primary || secondary) && (
            <div className="flex flex-wrap items-center gap-3">
              {primary ? (
                <Button size="lg" asChild>
                  <a href={primary.href}>
                    {primary.label} {primary.icon}
                  </a>
                </Button>
              ) : null}
              {secondary ? (
                <Button size="lg" variant="outline" asChild>
                  <a href={secondary.href}>{secondary.label}</a>
                </Button>
              ) : null}
            </div>
          )}
        </div>
        {children}
      </div>
    </section>
  )
}
