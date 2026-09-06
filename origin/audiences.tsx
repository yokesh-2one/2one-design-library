import { ROLES } from './content'

export function Audiences() {
  return (
    <section className="w-full border-b bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-4xl">
          Who feels it
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
          Same company. Four jobs. Four versions of the same mess.
        </p>
        <ul className="mt-14 grid gap-x-10 gap-y-9 border-t pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex flex-col gap-3">
              <Icon className="size-5 text-muted-foreground" aria-hidden />
              <h3 className="font-semibold tracking-tight">{title}</h3>
              <p className="text-sm text-muted-foreground text-pretty">{desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
