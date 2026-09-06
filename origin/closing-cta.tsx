import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function ClosingCta({
  title,
  body,
  href,
  label,
}: {
  title: string
  body: string
  href: string
  label: string
}) {
  return (
    <section className="w-full bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-20 text-center md:py-24">
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-4xl">{title}</h2>
        <p className="max-w-xl text-lg text-background/70 text-pretty">{body}</p>
        <Button size="lg" className="bg-background text-foreground shadow-sm hover:bg-background/90" asChild>
          <a href={href}>
            {label} <ArrowRight />
          </a>
        </Button>
      </div>
    </section>
  )
}
