import { STEPS } from './content'

export function HowItWorks() {
  return (
    <section className="w-full border-b bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-4xl">
          How Origin fixes it
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
          This MVP is the repository. The job does not change when it stands alone.
        </p>
        <ol className="mt-14 grid gap-10 border-t pt-10 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-3">
              <p className="text-sm tabular-nums text-muted-foreground">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="text-xl font-semibold tracking-tight">{step.title}</h3>
              <p className="text-muted-foreground text-pretty">{step.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
