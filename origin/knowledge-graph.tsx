import * as React from 'react'
import { Boxes, Palette, Route, ShieldCheck, Target, type LucideIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import {
  edgesOf,
  GRAPH_EDGES,
  GRAPH_NODES,
  type GraphNode,
  KIND_LABEL,
  type NodeKind,
  neighboursOf,
} from './graph-data'

export const KIND_ICON: Record<NodeKind, LucideIcon> = {
  core: Target,
  brand: Palette,
  block: Boxes,
  rule: ShieldCheck,
  decision: Route,
}

const VIEW_W = 100
const VIEW_H = 64

const NODE_BY_ID = new Map(GRAPH_NODES.map((n) => [n.id, n]))

function midpoint(a: GraphNode, b: GraphNode) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}

export function KnowledgeGraph({
  className,
  initialSelected = 'values',
  showPanel = true,
}: {
  className?: string
  initialSelected?: string
  showPanel?: boolean
}) {
  const [selected, setSelected] = React.useState<string>(initialSelected)
  const reduced = usePrefersReducedMotion()
  const [paused, setPaused] = React.useState(false)
  const [interacted, setInteracted] = React.useState(false)

  const select = React.useCallback((id: string) => {
    setSelected(id)
    setInteracted(true)
  }, [])

  React.useEffect(() => {
    if (reduced || paused || interacted) return
    const id = window.setInterval(() => {
      setSelected((cur) => {
        const i = GRAPH_NODES.findIndex((n) => n.id === cur)
        return GRAPH_NODES[(i + 1) % GRAPH_NODES.length].id
      })
    }, 2600)
    return () => window.clearInterval(id)
  }, [reduced, paused, interacted])

  const activeEdges = edgesOf(selected)
  const activeEdgeKey = new Set(activeEdges.map((e) => `${e.from}->${e.to}`))
  const neighbours = new Set(neighboursOf(selected))
  const node = NODE_BY_ID.get(selected)!
  const NodeIcon = KIND_ICON[node.kind]

  return (
    <div
      className={cn(
        showPanel ? 'grid gap-6 lg:grid-cols-[1.7fr_1fr] lg:items-stretch' : 'w-full',
        className,
      )}
    >
      <div className="min-w-0 overflow-x-auto">
        <Card
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          className={cn(
            'graph-stage relative aspect-[100/64] w-full gap-0 overflow-hidden py-0',
            showPanel && 'min-w-[36rem]',
          )}
        >
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
            preserveAspectRatio="xMidYMid meet"
          >
            {GRAPH_EDGES.map((e) => {
              const a = NODE_BY_ID.get(e.from)!
              const b = NODE_BY_ID.get(e.to)!
              const on = activeEdgeKey.has(`${e.from}->${e.to}`)
              return (
                <line
                  key={`${e.from}-${e.to}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className={cn(
                    'transition-[stroke] duration-500 motion-reduce:transition-none',
                    on ? 'stroke-brand' : 'stroke-border',
                  )}
                  vectorEffect="non-scaling-stroke"
                  strokeWidth={on ? 1.5 : 1}
                  strokeLinecap="round"
                />
              )
            })}

            {!reduced &&
              activeEdges.map((e, i) => {
                const otherId = e.from === selected ? e.to : e.from
                const to = NODE_BY_ID.get(otherId)!
                const dur = '1.3s'
                const begin = `${i * 0.16}s`
                return (
                  <circle key={`pulse-${selected}-${otherId}`} r={0.7} className="fill-brand">
                    <animate
                      attributeName="cx"
                      values={`${node.x};${to.x}`}
                      dur={dur}
                      begin={begin}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="cy"
                      values={`${node.y};${to.y}`}
                      dur={dur}
                      begin={begin}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0;1;1;0"
                      keyTimes="0;0.15;0.7;1"
                      dur={dur}
                      begin={begin}
                      repeatCount="indefinite"
                    />
                  </circle>
                )
              })}

            {!reduced && (
              <circle
                key={`ping-${selected}`}
                cx={node.x}
                cy={node.y}
                className="fill-none stroke-brand"
                vectorEffect="non-scaling-stroke"
                strokeWidth={1}
              >
                <animate attributeName="r" values="2;7" dur="2.1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.45;0" dur="2.1s" repeatCount="indefinite" />
              </circle>
            )}

            {activeEdges.map((e) => {
              const a = NODE_BY_ID.get(e.from)!
              const b = NODE_BY_ID.get(e.to)!
              const m = midpoint(a, b)
              return (
                <g key={`lbl-${e.from}-${e.to}`}>
                  <rect
                    x={m.x - e.rel.length * 0.58 - 1}
                    y={m.y - 1.7}
                    width={e.rel.length * 1.16 + 2}
                    height={3.4}
                    rx={1.7}
                    className="fill-card stroke-border"
                    strokeWidth={0.15}
                  />
                  <text
                    x={m.x}
                    y={m.y + 0.65}
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    style={{ fontSize: 1.9 }}
                  >
                    {e.rel}
                  </text>
                </g>
              )
            })}
          </svg>

          {GRAPH_NODES.map((n) => {
            const isSelected = n.id === selected
            const isNeighbour = neighbours.has(n.id)
            const dimmed = !isSelected && !isNeighbour
            const Icon = KIND_ICON[n.kind]
            return (
              <button
                key={n.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => select(n.id)}
                style={{ left: `${(n.x / VIEW_W) * 100}%`, top: `${(n.y / VIEW_H) * 100}%` }}
                className={cn(
                  'absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1.5 text-xs font-medium shadow-sm',
                  'transition motion-reduce:transition-none hover:border-foreground hover:shadow-md',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  isSelected && 'border-brand ring-2 ring-brand/40',
                  !isSelected && n.kind === 'core' && 'border-foreground',
                  dimmed && 'opacity-45',
                )}
              >
                <Icon className="size-3.5 shrink-0" aria-hidden />
                <span className="whitespace-nowrap">{n.label}</span>
              </button>
            )
          })}
        </Card>
      </div>

      {showPanel ? (
        <Card role="complementary" aria-live="polite" className="flex flex-col gap-0 p-6">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg border bg-muted">
              <NodeIcon className="size-4" aria-hidden />
            </span>
            <Badge variant="secondary">{KIND_LABEL[node.kind]}</Badge>
          </div>
          <h3 className="mt-4 text-lg font-semibold tracking-tight">{node.label}</h3>
          <p className="mt-2 text-sm text-muted-foreground text-pretty">{node.blurb}</p>

          <div className="mt-5 border-t pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {neighbours.size === 1 ? 'Touches 1 node' : `Touches ${neighbours.size} nodes`}
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {activeEdges.map((e) => {
                const otherId = e.from === selected ? e.to : e.from
                const other = NODE_BY_ID.get(otherId)!
                const dir = e.from === selected ? `${e.rel} →` : `← ${e.rel}`
                return (
                  <li key={`${e.from}-${e.to}`} className="flex items-center justify-between gap-3 text-sm">
                    <button
                      type="button"
                      onClick={() => select(otherId)}
                      className="rounded text-left font-medium underline-offset-4 transition-colors motion-reduce:transition-none hover:text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {other.label}
                    </button>
                    <span className="shrink-0 text-xs text-muted-foreground">{dir}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <p className="mt-auto pt-5 text-xs text-muted-foreground">
            Select any node. The walk is the same every time.
          </p>
        </Card>
      ) : null}
    </div>
  )
}
