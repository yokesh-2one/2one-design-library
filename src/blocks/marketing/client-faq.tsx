import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Client / evaluation FAQ — the questions decision-makers ask when they first
// see the system, answered in the 2one voice (factual, no hype, honest about the
// gaps). Prose content, so the reading column is capped narrower than an app
// layout; built from the existing Accordion, Badge and Button primitives.
const FAQS = [
  {
    q: "Whose brand do we build with — ours or 2one's?",
    a: "This repository is 2one's own system: our brand, built on shadcn/ui, so our team ships product and marketing that already look like 2one. We share it so you can try the approach on something real. If it fits, we build the same foundations for your brand, wire them into your front-end library, and wrap an application around them for your team.",
  },
  {
    q: "What can our team actually produce with it?",
    a: "Websites, marketing pages and product screens — generated with AI against the system's rules, so the output stays on-brand and carries fewer bugs. The same foundations live in Figma for designers and developers to share. It won't hand you a finished application: it gives you a strong, consistent first version, and your team makes it their own.",
  },
  {
    q: "Who is it for?",
    a: "The people deciding are product and engineering leaders — VPs, product managers, CXOs — who want their teams using AI productively, without the slop. The people using it day to day are developers, marketing teams and product managers who build against it. We share it with both, and we weigh the developers' feedback most.",
  },
  {
    q: "Is it tied to shadcn, and how is it licensed?",
    a: "No. shadcn is simply what 2one runs on; if your team is on MudBlazor, or anything else, we build the same system there. Licensing is yours to choose — open (MIT) by default, so anyone can clone and use it, or proprietary if you would rather keep it in-house.",
  },
  {
    q: "How do we get access?",
    a: "Clone the repository and install the packages locally. Access is being opened up so there is nothing to set up — the people we share it with can pull it and start building. Today it is the foundation our team builds on; on the roadmap, a shared design system your whole organisation can draw from.",
  },
]

// Marketing FAQ aimed at teams evaluating the system — questions answered through
// the existing Accordion, closing with a single primary CTA.
export function MarketingClientFaq({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("w-full border-b bg-background", className)}
      aria-labelledby="client-faq-heading"
      {...props}
    >
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-24">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge variant="secondary">For teams evaluating 2one</Badge>
          <h2 id="client-faq-heading" className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Questions teams ask us
          </h2>
          <p className="max-w-xl text-lg text-muted-foreground text-pretty">
            What the system is, what your team can build with it, and how an engagement works.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-10 w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">Want to see it against your brand?</p>
          <Button size="lg">
            Book a walkthrough <ArrowRight />
          </Button>
        </div>
      </div>
    </section>
  )
}
