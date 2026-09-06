import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export function SiteFaq({
  heading,
  items,
}: {
  heading: string
  items: { q: string; a: string }[]
}) {
  return (
    <section className="w-full border-b bg-background">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-24">
        <h2 className="text-center text-3xl font-bold tracking-tight text-balance md:text-4xl">{heading}</h2>
        <Accordion type="single" collapsible className="mt-10 w-full">
          {items.map((f, i) => (
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
