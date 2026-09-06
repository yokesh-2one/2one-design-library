import { Logo } from '@/components/logo'
import { Separator } from '@/components/ui/separator'

import { LINKS } from './nav'
import { formatScore, scoreById } from './scores'

const COLUMNS = [
  {
    title: 'Product',
    links: [LINKS.product, LINKS.graph, LINKS.pricing],
  },
  {
    title: 'Company',
    links: [LINKS.about, LINKS.contact, LINKS.company],
  },
  {
    title: 'System',
    links: [LINKS.repo, LINKS.llms, LINKS.a11y, LINKS.install, LINKS.scores],
  },
]

export function SiteFooter() {
  const ver = scoreById('package_version')
  return (
    <footer className="mt-auto w-full border-t bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Logo variant="black" width={64} className="dark:hidden" />
            <Logo variant="white" width={64} className="hidden dark:block" />
            <p className="max-w-xs text-sm text-muted-foreground">
              Origin holds the brand so product and marketing stop looking like two
              companies. This MVP is the repository.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">{col.title}</h3>
              {col.links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          ))}
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <span>
            © {new Date().getFullYear()} 2one Solutions. Origin is a 2one product
            {ver ? ` (v${formatScore(ver)})` : ''}
            .
          </span>
          <span>Grayscale foundation · one brand accent · lucide icons</span>
        </div>
      </div>
    </footer>
  )
}
