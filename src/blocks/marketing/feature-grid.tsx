import { Boxes, Gauge, Palette, ShieldCheck, Sparkles, Workflow } from "lucide-react"

import { cn } from "@/lib/utils"

const FEATURES = [
  { icon: Boxes, title: "Real components", desc: "54 shadcn/ui primitives re-skinned to the 2one tokens, not screenshots." },
  { icon: Palette, title: "One token system", desc: "Grayscale by design. Change a token in one place and every screen follows." },
  { icon: ShieldCheck, title: "Accessible by default", desc: "Radix primitives and an APCA contrast audit that runs on every change." },
  { icon: Gauge, title: "Light + dark", desc: "Two audited themes ship together, with no third palette to maintain." },
  { icon: Sparkles, title: "AI-legible", desc: "A manifest, knowledge graph and rules so any AI builds on-brand, first try." },
  { icon: Workflow, title: "Impact analysis", desc: "Ask what a token change touches before you ship it. Change-safety at scale." },
]

// Feature grid — a LEFT-ALIGNED section heading over a two-column list of
// features with the icon INLINE (left of the text), deliberately not the
// centered heading + row-of-icon-on-top-cards shape AI tools default to.
export function MarketingFeatureGrid({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section className={cn("w-full border-b bg-background", className)} {...props}>
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Everything you need to stay on-brand
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            The building blocks and the guardrails, in one place.
          </p>
        </div>
        <div className="mt-14 grid gap-x-10 gap-y-9 border-t pt-10 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted text-foreground">
                <Icon className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold tracking-tight">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground text-pretty">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
