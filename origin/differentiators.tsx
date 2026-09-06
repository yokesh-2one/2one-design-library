import { DIFFERENTIATORS } from './content'

export function Differentiators() {
  return (
    <section className="w-full border-b bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-4xl">
          The problem Origin is for
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
          If none of these hurt, you do not need Origin. Keep the canvas.
        </p>
        <ol className="mt-14 grid gap-x-10 gap-y-12 border-t pt-10 md:grid-cols-2">
          {DIFFERENTIATORS.map(({ icon: Icon, title, desc }, i) => (
            <li key={title} className="flex flex-col gap-3">
              <p className="text-sm tabular-nums text-muted-foreground">
                {String(i + 1).padStart(2, '0')}
              </p>
              <Icon className="size-5 text-muted-foreground" aria-hidden />
              <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
              <p className="text-muted-foreground text-pretty">{desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
