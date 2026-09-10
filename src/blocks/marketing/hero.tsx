import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Marketing hero — a LEFT-ALIGNED, two-column lockup (copy left, media right),
// not the centered-headline-with-a-badge-on-top shape every AI tool defaults to.
// Headline + subhead + one primary pill CTA (+ a secondary), and a media slot.
export function MarketingHero({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section className={cn("w-full border-b bg-background", className)} {...props}>
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div className="flex flex-col items-start gap-6">
          <h1 className="max-w-xl text-4xl font-bold tracking-tight text-balance md:text-6xl">
            Ship on-brand product, faster.
          </h1>
          <p className="max-w-md text-lg text-muted-foreground text-pretty">
            One source of truth for every piece 2one builds: components, tokens and brand,
            so people and AI create products that look and feel like 2one.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg">
              Get started <ArrowRight />
            </Button>
            <Button size="lg" variant="outline">
              Read the docs
            </Button>
          </div>
        </div>
        {/* media slot — drop a product screenshot or video here */}
        <div className="flex aspect-video w-full items-center justify-center rounded-xl border bg-muted text-sm text-muted-foreground">
          Product preview
        </div>
      </div>
    </section>
  )
}
