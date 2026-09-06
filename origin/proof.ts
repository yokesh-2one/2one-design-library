import graph from '../graph.json'
import coverage from '../metrics/visual-coverage.json'
import rules from '../rules/ux-rules.json'

type GraphFile = {
  stats: { nodes: number; edges: number }
}

type RulesFile = {
  version: string
  rules: { id: string }[]
}

type CoverageFile = {
  cases: number
  screenshots: number
  screenshot_matrix: number
  state_cases: number
  aria: number
  rtl: number
  forced_colors: number
  components: number
  components_with_case: number
}

const GRAPH = graph as GraphFile
const RULES = rules as RulesFile
const COVERAGE = coverage as CoverageFile

export function graphStats() {
  return GRAPH.stats
}

export function rulesContract() {
  return { version: RULES.version, count: RULES.rules.length }
}

export function visualCoverage() {
  return COVERAGE
}
