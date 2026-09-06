import { MARKET_FOR } from './content'

export function Market() {
  return (
    <section className="w-full border-b bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-4xl">
          If this is your team
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
          You already share one brand across product and marketing. You want AI
          to help without guessing the look.
        </p>
        <ul className="mt-10 max-w-2xl list-disc space-y-3 border-t pt-10 pl-5 text-muted-foreground">
          {MARKET_FOR.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
