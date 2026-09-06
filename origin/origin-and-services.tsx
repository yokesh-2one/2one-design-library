import { Briefcase, Network } from 'lucide-react'

const OFFER = [
  {
    icon: Network,
    title: 'Origin',
    desc: 'The product. The brand lives here so AI and the team stop inventing a look. Today that is this repository. Sold as a service.',
  },
  {
    icon: Briefcase,
    title: '2one professional services',
    desc: 'People in the room: AI and UX strategy, reviews, the work around a real project.',
  },
]

export function OriginAndServices() {
  return (
    <section className="w-full border-b bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Origin and 2one
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Licence the product. Call the consultancy when you want a team as well.
          </p>
        </div>
        <div className="mt-14 grid gap-12 border-t pt-10 md:grid-cols-2">
          {OFFER.map((row) => (
            <div key={row.title} className="flex flex-col gap-3">
              <row.icon className="size-5 text-muted-foreground" aria-hidden />
              <h3 className="text-xl font-semibold tracking-tight">{row.title}</h3>
              <p className="text-muted-foreground text-pretty">{row.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
