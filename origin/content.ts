import {
  Code,
  Database,
  Eye,
  FileJson,
  GitBranch,
  type LucideIcon,
  Layout,
  Megaphone,
  Network,
  Palette,
  ListChecks,
} from 'lucide-react'

export interface Feature {
  icon: LucideIcon
  title: string
  desc: string
}

export interface Role {
  icon: LucideIcon
  title: string
  desc: string
}

export interface Step {
  title: string
  desc: string
}

export const STEPS: Step[] = [
  {
    title: 'Put the brand in one place',
    desc: 'Colour, type, voice, components, and who you serve. Not a pile of files in chat.',
  },
  {
    title: 'Make the next screen follow it',
    desc: 'Ask for a pricing page twice and you should get the same structure. That is the point.',
  },
  {
    title: 'Catch drift before it ships',
    desc: 'Product and marketing use the same brand. A check flags work that does not.',
  },
]

export const ROLES: Role[] = [
  {
    icon: Palette,
    title: 'Designers',
    desc: 'Put the system here once. Stop restyling the same screen every sprint.',
  },
  {
    icon: ListChecks,
    title: 'Product managers',
    desc: 'Two people ask for the same screen and get two layouts. Origin is how the next request stays the same.',
  },
  {
    icon: Code,
    title: 'Developers',
    desc: 'Off-brand UI ships until someone notices in review. Origin fails that work in a check.',
  },
  {
    icon: Megaphone,
    title: 'Marketing',
    desc: 'The website looks like a different company than the product. Origin is the same brand for both.',
  },
]

export const PRODUCT_PARTS: Feature[] = [
  {
    icon: Layout,
    title: 'Components',
    desc: 'Ready-made UI: buttons, forms, tables, charts. Built so product and marketing screens match.',
  },
  {
    icon: Database,
    title: 'Brand data',
    desc: 'Colour, type, spacing, voice, and personas. Photography and illustration are not included.',
  },
  {
    icon: GitBranch,
    title: 'Knowledge engine',
    desc: 'Rules for how to compose those parts. That is what guides AI, not a one-off prompt.',
  },
]

export const HOME_FEATURES = PRODUCT_PARTS

export const DIFFERENTIATORS: Feature[] = [
  {
    icon: FileJson,
    title: 'AI invents a look',
    desc: 'Without a source of truth, every prompt guesses colour, type, and layout. Origin is that source. Tools are told to read it and not invent the brand.',
  },
  {
    icon: Network,
    title: 'A small change surprises you later',
    desc: 'You change a token or a component and only find the fallout in QA. Origin shows what a change touches before you ship.',
  },
  {
    icon: ListChecks,
    title: 'The rules live in someone’s head',
    desc: '“We don’t do that” is not a system. Origin stores the 2one way as decisions with a clear order when they conflict. Accessibility is not traded for polish.',
  },
  {
    icon: Eye,
    title: 'Drift only shows up in a meeting',
    desc: 'Review by eye does not scale. Origin fails off-brand work in a check, including contrast in light and dark. You still look. You do not start from nothing.',
  },
]

export interface VersusRow {
  job: string
  figma: string
  claudeDesign: string
  origin: string
}

export const VERSUS: VersusRow[] = [
  {
    job: 'Draw on a canvas',
    figma: 'Yes',
    claudeDesign: 'Yes',
    origin: 'No. Sketch elsewhere.',
  },
  {
    job: 'Hold the company’s design data',
    figma: 'In the file',
    claudeDesign: 'On the canvas',
    origin: 'Yes. That is the product (MVP).',
  },
  {
    job: 'Guide AI with your rules',
    figma: 'Not this product',
    claudeDesign: 'Not this product',
    origin: 'Yes. The knowledge engine.',
  },
  {
    job: 'Check the result is on brand',
    figma: 'You look',
    claudeDesign: 'You look',
    origin: 'Yes. A check in the product, not only a visual review.',
  },
]

export const MARKET_FOR = [
  'Designers who want one system, not a new mock every sprint',
  'PMs who want the same screen when two people ask the same question',
  'Developers who want a package and a check, not a slide deck',
  'Marketing who want the website to match the product',
]

export const HOME_FAQ = [
  {
    q: 'What problem does Origin solve?',
    a: 'The brand is scattered, so AI and teams invent a look. Product and marketing stop matching. Origin holds the brand in one place and makes the next screen follow it.',
  },
  {
    q: 'Who feels that problem?',
    a: 'Designers restyling the same mock. PMs getting two layouts for one request. Developers shipping off-brand UI. Marketing running a site that looks like another product.',
  },
  {
    q: 'Do I still use Figma or Claude Design?',
    a: 'Yes, if you still need a canvas. Origin does not draw. It is where the brand and rules live so AI does not invent the look.',
  },
  {
    q: 'Will two teams get the same layout?',
    a: 'They should, for a given request. That is the problem Origin is built to close.',
  },
  {
    q: 'Can we put our own brand in on the free plan?',
    a: 'No. Free uses 2one’s look and rules. Your brand in the files is the Customise plan.',
  },
  {
    q: 'Where are the commands and file names?',
    a: 'On the Origin product page, under If you install it. Home stays on the problem.',
  },
]
