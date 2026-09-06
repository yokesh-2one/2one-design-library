import snapshot from '../metrics/snapshot.json'

export type ScoreKind = 'measured' | 'estimated' | 'qualitative'
export type ScoreSurface = 'marketing' | 'ask' | 'internal'

export interface Score {
  id: string
  label: string
  value: string | number | boolean
  unit: string
  kind: ScoreKind
  category?: string
  surfaces: string[]
  source: string
  product_use: string
  method?: string
}

const data = snapshot as {
  est_chars_per_token: number
  assumptions: {
    retrieved: string
    model: string
    usd_per_million_input_tokens: number
    source: string
    labour_usd_per_hour: number
    minutes_without: number
    minutes_with: number
  }
  kpis: Score[]
  scores: Score[]
}

export function allScores(): Score[] {
  return data.scores
}

export function allKpis(): Score[] {
  return data.kpis
}

export function scoresFor(surface: ScoreSurface): Score[] {
  return data.scores.filter((s) => s.surfaces.includes(surface))
}

export function kpisFor(surface: ScoreSurface): Score[] {
  return data.kpis.filter((s) => s.surfaces.includes(surface))
}

export function scoreById(id: string): Score | undefined {
  return data.kpis.find((s) => s.id === id) ?? data.scores.find((s) => s.id === id)
}

export function formatScore(s: Score): string {
  if (typeof s.value === 'boolean') return s.value ? 'Yes' : 'No'
  if (typeof s.value === 'number' && s.unit === 'bytes') {
    return `${s.value.toLocaleString()} bytes`
  }
  if (typeof s.value === 'number' && s.unit === 'est_tokens') {
    return `~${s.value.toLocaleString()} (estimate)`
  }
  if (typeof s.value === 'number' && s.unit === 'usd') {
    return s.value >= 1
      ? `$${s.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} (estimate)`
      : `$${s.value.toFixed(4)} (estimate)`
  }
  if (typeof s.value === 'number' && s.unit === 'hours') {
    return `${s.value} h (model)`
  }
  if (typeof s.value === 'number' && s.unit === 'percent') {
    return `${s.value}%`
  }
  if (typeof s.value === 'number' && s.unit === 'ratio') {
    return `${s.value}×`
  }
  return String(s.value)
}

export const EST_CHARS_PER_TOKEN = data.est_chars_per_token
export const KPI_ASSUMPTIONS = data.assumptions
