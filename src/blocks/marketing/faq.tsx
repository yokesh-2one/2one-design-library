import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const FAQS = [
  { q: "Is it really just grayscale?", a: "Grayscale is the foundation, with one disciplined brand accent (2one Blue) for emphasis: links, focus, selection. Structure and primary actions stay grayscale; danger and success stay reserved for validation. That restraint is what keeps every screen looking like one system." },
  { q: "Does it support dark mode?", a: "It ships two audited themes, light and dark, that are contrast-checked on every change. Wrap your app in the ThemeProvider to switch between them." },
  { q: "How do I use it with AI tools?", a: "Point your assistant at the repo. A machine-readable manifest, a knowledge graph and a rules file let Claude, Cursor, Copilot or Gemini build on-brand without re-explaining the system." },
  { q: "Can I change the components?", a: "They're standard shadcn/ui components re-skinned to the tokens, so you extend them the normal way, and templates in src/blocks are copy-in starting points you own." },
  { q: "What does it cost?", a: "The Starter tier is free. Paid tiers add templates, impact analysis and support. See pricing above." },
]

// FAQ — questions answered through the existing Accordion component.
export function MarketingFaq({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section className={cn("w-full border-b bg-background", className)} {...props}>
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-24">
        <h2 className="text-center text-3xl font-bold tracking-tight text-balance md:text-4xl">
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="mt-10 w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
