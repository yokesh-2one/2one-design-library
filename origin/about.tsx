import { ArrowRight, Building2, Network } from 'lucide-react'

import { ClosingCta } from './closing-cta'
import { Market } from './market'
import { LINKS } from './nav'
import { PageCrumb } from './page-crumb'
import { PageHero } from './page-hero'

const PILLARS = [
  {
    icon: Building2,
    title: '2one Solutions',
    desc: 'A design and strategy consultancy. Mission: create structure in an unstructured world.',
  },
  {
    icon: Network,
    title: 'Origin',
    desc: 'The product. The brand lives here so the team and AI stop inventing a look. Sold as a service.',
  },
]

export function AboutPage() {
  return (
    <main>
      <PageCrumb current="About" />
      <PageHero
        eyebrow="2one Solutions"
        title="About 2one Solutions and Origin"
        body={
          <>
            <p>
              2one Solutions is a design and strategy consultancy. Origin is the
              product: the brand lives here so product and marketing stop looking
              like two companies.
            </p>
            <p className="mt-4">
              Need a person on AI or UX strategy? That’s consulting around Origin.
              The header is still just the wordmark.
            </p>
          </>
        }
        primary={{ href: LINKS.contact.href, label: LINKS.contact.label, icon: <ArrowRight /> }}
        secondary={{ href: LINKS.product.href, label: LINKS.product.label }}
      >
        <div className="flex flex-col gap-10">
          {PILLARS.map((p) => (
            <div key={p.title} className="flex flex-col gap-2">
              <p className="flex items-center gap-2 text-sm font-medium">
                <p.icon className="size-4 text-muted-foreground" aria-hidden />
                {p.title}
              </p>
              <p className="text-muted-foreground text-pretty">{p.desc}</p>
            </div>
          ))}
        </div>
      </PageHero>

      <Market />

      <ClosingCta
        title="Start a project with 2one"
        body="Start Origin on a real project. Ask 2one in when you want a team on AI and UX strategy."
        href={LINKS.contact.href}
        label={LINKS.contact.label}
      />
    </main>
  )
}
