export type RouteId = 'home' | 'product' | 'graph' | 'pricing' | 'about' | 'contact' | 'scores'

/** Same href always uses the same label (link purpose out of context). */
export const LINKS = {
  home: { href: '/', label: 'Home' },
  product: { href: '/product.html', label: 'Origin' },
  graph: { href: '/graph.html', label: 'How it works' },
  pricing: { href: '/pricing.html', label: 'Pricing' },
  about: { href: '/about.html', label: 'About' },
  contact: { href: '/contact.html', label: 'Contact' },
  company: { href: 'https://2one.solutions', label: '2one Solutions' },
  repo: {
    href: 'https://github.com/yokesh-2one/2one-design-library',
    label: 'GitHub repository',
  },
  agentsGuide: {
    href: 'https://github.com/yokesh-2one/2one-design-library/blob/main/AGENTS.md',
    label: 'repository agent guide',
  },
  manifest: {
    href: 'https://github.com/yokesh-2one/2one-design-library/blob/main/manifest.json',
    label: 'live manifest.json',
  },
  a11y: {
    href: 'https://github.com/yokesh-2one/2one-design-library/blob/main/docs/accessibility.md',
    label: 'Accessibility',
  },
  install: {
    href: 'https://github.com/yokesh-2one/2one-design-library/blob/main/docs/consuming.md',
    label: 'How to install',
  },
  llms: {
    href: 'https://github.com/yokesh-2one/2one-design-library/blob/main/llms.txt',
    label: 'llms.txt',
  },
  visualCoverage: {
    href: 'https://github.com/yokesh-2one/2one-design-library/blob/main/docs/visual-coverage.md',
    label: 'visual coverage scorecard',
  },
  scores: { href: '/metrics.html', label: 'Product KPIs' },
} as const

export const ROUTES: { id: RouteId; href: string; label: string }[] = [
  { id: 'product', href: LINKS.product.href, label: LINKS.product.label },
  { id: 'graph', href: LINKS.graph.href, label: LINKS.graph.label },
  { id: 'pricing', href: LINKS.pricing.href, label: LINKS.pricing.label },
  { id: 'about', href: LINKS.about.href, label: LINKS.about.label },
]
