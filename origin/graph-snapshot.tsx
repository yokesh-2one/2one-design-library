import graph from '../graph.json'

type GraphFile = {
  stats: {
    nodes: number
    edges: number
    by_node_type: Record<string, number>
  }
  nodes: { id: string; label?: string; type?: string }[]
  edges: { source: string; target: string; type: string }[]
}

const GRAPH = graph as GraphFile

const TYPE_COPY: Record<string, string> = {
  component: 'shadcn primitives, re-skinned',
  rule: 'UX contract, with severity',
  'token-color': 'semantic colour tokens',
  'template-chart': 'chart recipes',
  intent: 'named user goals',
}

export function graphFile() {
  return GRAPH
}

export function graphCounts() {
  return GRAPH.stats
}

export function topNodeTypes(n = 5) {
  return Object.entries(GRAPH.stats.by_node_type)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([type, count]) => ({ type, count, note: TYPE_COPY[type] ?? 'graph node family' }))
}

export function liveDecisions(intentIds: string[]) {
  const byId = new Map(GRAPH.nodes.map((n) => [n.id, n]))
  const want = new Set(intentIds)
  return GRAPH.edges
    .filter((e) => e.type === 'realized_by' && want.has(e.source))
    .map((e) => {
      const parts = GRAPH.edges
        .filter((c) => c.type === 'preferred_composition' && c.source === e.target)
        .map((c) => byId.get(c.target)?.label ?? c.target.replace(/^component:/, ''))
      return {
        id: e.source,
        label: byId.get(e.source)?.label ?? e.source,
        use: byId.get(e.target)?.label ?? e.target,
        node: e.target,
        parts,
      }
    })
}

export function GraphSnapshot() {
  const stats = GRAPH.stats
  const rows = topNodeTypes(4)
  const example = liveDecisions(['intent:present-pricing'])[0]

  return (
    <aside className="flex flex-col gap-8">
      <dl className="grid grid-cols-2 gap-8">
        <div>
          <dt className="text-sm text-muted-foreground">Nodes</dt>
          <dd className="mt-1 text-5xl font-bold tracking-tight tabular-nums">{stats.nodes}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Edges</dt>
          <dd className="mt-1 text-5xl font-bold tracking-tight tabular-nums">{stats.edges}</dd>
        </div>
      </dl>
      {example ? (
        <p className="text-base text-pretty">
          {example.parts.length > 0
            ? `${example.label} resolves to ${example.use}, composed of ${example.parts.join(', ')}.`
            : `${example.label} resolves to ${example.use}.`}
        </p>
      ) : null}
      <dl className="flex flex-col gap-4 border-t pt-6">
        {rows.map((row) => (
          <div key={row.type} className="flex items-baseline justify-between gap-4">
            <dt>
              <span className="font-medium">{row.type}</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">{row.note}</span>
            </dt>
            <dd className="text-lg font-semibold tabular-nums">{row.count}</dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}
