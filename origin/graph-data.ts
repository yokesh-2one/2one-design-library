import { formatScore, scoreById } from './scores'

// Curated marketing graph. Data only (no JSX). Positions are authored, not
// simulated. This is the walk Origin performs; live counts stay in graph.json.

export type NodeKind = 'core' | 'brand' | 'block' | 'rule' | 'decision'

export interface GraphNode {
  id: string
  label: string
  kind: NodeKind
  x: number
  y: number
  blurb: string
}

export interface GraphEdge {
  from: string
  to: string
  rel: string
}

export const KIND_LABEL: Record<NodeKind, string> = {
  core: 'Core',
  brand: 'Brand foundation',
  block: 'Building block',
  rule: 'Guardrail',
  decision: 'Outcome',
}

function componentBlurb() {
  const total = scoreById('components_total')
  if (!total) {
    return 'The UI kit: buttons, forms, tables, charts. Styled by the brand tokens.'
  }
  return `${formatScore(total)} building blocks for screens, styled by the tokens.`
}

export const GRAPH_NODES: GraphNode[] = [
  {
    id: 'values',
    label: 'Values and mission',
    kind: 'core',
    x: 13,
    y: 32,
    blurb: 'What the company believes. Everything else should follow from this.',
  },
  {
    id: 'voice',
    label: 'Brand voice',
    kind: 'brand',
    x: 35,
    y: 9,
    blurb: 'How the product speaks: short, factual, no hype.',
  },
  {
    id: 'tokens',
    label: 'Design tokens',
    kind: 'brand',
    x: 34,
    y: 33,
    blurb: 'Colour, type, and spacing. Change a token once and the screens that use it follow.',
  },
  {
    id: 'personas',
    label: 'Personas',
    kind: 'brand',
    x: 35,
    y: 55,
    blurb: 'Who you are building for.',
  },
  {
    id: 'components',
    label: 'Components',
    kind: 'block',
    x: 58,
    y: 16,
    blurb: componentBlurb(),
  },
  {
    id: 'patterns',
    label: 'Patterns',
    kind: 'block',
    x: 58,
    y: 40,
    blurb: 'Whole screens: a pricing page, an app shell. Built from components, for the people you named.',
  },
  {
    id: 'guardrails',
    label: 'Guardrails',
    kind: 'rule',
    x: 44,
    y: 60,
    blurb: 'The rules: one accent, one main action, never colour alone, accessibility first.',
  },
  {
    id: 'decision',
    label: 'On-brand decision',
    kind: 'decision',
    x: 82,
    y: 26,
    blurb: 'Which pieces fit this request. Ask twice, get the same answer.',
  },
  {
    id: 'impact',
    label: 'Impact analysis',
    kind: 'decision',
    x: 82,
    y: 49,
    blurb: 'What a change will touch, before you ship it.',
  },
]

export const GRAPH_EDGES: GraphEdge[] = [
  { from: 'values', to: 'voice', rel: 'embodies' },
  { from: 'values', to: 'tokens', rel: 'defines' },
  { from: 'values', to: 'personas', rel: 'serves' },
  { from: 'values', to: 'guardrails', rel: 'encodes' },
  { from: 'voice', to: 'components', rel: 'shapes' },
  { from: 'tokens', to: 'components', rel: 'styles' },
  { from: 'tokens', to: 'patterns', rel: 'styles' },
  { from: 'personas', to: 'patterns', rel: 'informs' },
  { from: 'components', to: 'decision', rel: 'composes' },
  { from: 'patterns', to: 'decision', rel: 'composes' },
  { from: 'guardrails', to: 'decision', rel: 'governs' },
  { from: 'components', to: 'impact', rel: 'traces' },
  { from: 'decision', to: 'impact', rel: 'feeds' },
]

export function neighboursOf(id: string): string[] {
  const set = new Set<string>()
  for (const e of GRAPH_EDGES) {
    if (e.from === id) set.add(e.to)
    if (e.to === id) set.add(e.from)
  }
  return [...set]
}

export function edgesOf(id: string): GraphEdge[] {
  return GRAPH_EDGES.filter((e) => e.from === id || e.to === id)
}
