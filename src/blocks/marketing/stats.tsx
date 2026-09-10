import { cn } from "@/lib/utils"

const STATS = [
  { value: "59", label: "Components" },
  { value: "40", label: "Templates" },
  { value: "100%", label: "APCA audited" },
  { value: "2", label: "Themes" },
]

// Stats — a LEFT-ALIGNED framing line beside the numbers, rather than a centered
// row of big figures floating on their own (the default "stat banner" shape).
// Numbers in the heading face, tabular. Grayscale.
export function MarketingStats({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section className={cn("w-full border-b bg-muted/40", className)} {...props}>
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-sm text-2xl font-bold tracking-tight text-balance md:text-3xl">
            One system, measured on every change.
          </h2>
          <dl className="flex flex-wrap gap-x-12 gap-y-6">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="text-sm text-muted-foreground">{s.label}</dt>
                <dd className="mt-1 text-4xl font-bold tracking-tight tabular-nums md:text-5xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
