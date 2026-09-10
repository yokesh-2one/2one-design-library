// @expect badge-above-h1
// The AI-hero cliche: a pill badge stacked right on top of a centred H1 — the
// single most recognisable AI-generated landing shape. No token rule catches it
// because every class is legal; the SHAPE is the tell.
import { Badge } from '@2one/design-library'

export function Hero() {
  return (
    <section className="mx-auto flex flex-col items-center gap-6 text-center">
      <Badge variant="secondary">New · v2</Badge>
      <h1 className="text-6xl font-bold">Ship faster than ever</h1>
    </section>
  )
}
