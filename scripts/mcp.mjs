#!/usr/bin/env node
/*
  The DLS as an MCP server.

  An MCP server is not a deployed service. The LLM host spawns this process and
  talks to it over stdin/stdout, one process per configured payload. Nothing
  listens on a port and the client's source never leaves the machine.

    npx 2one mcp --payload <design-system> [--project <app>]
    DLS_PAYLOAD=<design-system> DLS_PROJECT=<app> npx 2one mcp

  ---- payload and project are two different folders ----

  The PAYLOAD is the design system: tokens, brand, rules, graph, components. The
  PROJECT is the app being built with it. Inside the design-system repo they are
  the same folder. For a client they are not: the design system arrives in
  node_modules/@2one/design-library and the client's code lives in their own
  src/.

  The first version of this server had one root and used it for both. Pointed at
  an installed package, dls_info told a client it was "inside the 2one repo" and
  handed them an `@/components/ui/button` import that does not resolve in their
  app, and `dls_check src/App.tsx` looked for the file inside the package. Found
  by installing the packed build into an empty folder and asking it what a new
  client would ask.

  So the project is resolved on its own:
    - --project or DLS_PROJECT, when given
    - otherwise, if the payload sits inside a node_modules folder, the directory
      that node_modules belongs to. Derived from the path, not guessed: an
      installed package has exactly one app above its first node_modules.
    - otherwise the payload itself, which is the design-system repo case.

  ---- why the payload is never guessed ----

  The engine finds a payload by walking up from the working directory looking for
  dls.config.json. That is right for a CLI, where the user's shell is already in
  the project. It is wrong here: the HOST decides this process's working
  directory, and that is routinely the user's home folder or the app bundle. A
  server that guessed would answer confidently about whichever design system it
  happened to land in.

  So the payload is required, and unresolvable is a startup failure rather than a
  fallback. Every tool response names the payload AND the project it answered
  about, so a wrong answer is visible instead of merely plausible.

  ---- why stdout is protected ----

  stdout IS the protocol. One stray console.log anywhere in the engine corrupts
  the JSON-RPC stream and the host sees a parse error rather than a bug. The
  engine's entry points are inert on import and print nothing, which is the
  property `check:api` exists to hold, but this file does not get to assume it.
  console.log is redirected to stderr before anything else loads.

  Run: npx 2one mcp (see docs/mcp.md)
*/
import { readFileSync, existsSync } from 'node:fs'
import { join, resolve, isAbsolute, relative, sep } from 'node:path'

/*
  Before ANY other import: stdout belongs to the transport. Redirecting here
  rather than after the engine loads means even an import-time print is caught.
*/
console.log = console.error
console.info = console.error
console.debug = console.error

const args = process.argv.slice(2)
const flag = (name) => {
  const i = args.indexOf(`--${name}`)
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : null
}

const fail = (message, hint) => {
  console.error(`\n  2one mcp: ${message}\n`)
  if (hint) console.error(`${hint}\n`)
  process.exit(1)
}

// Resolved against the directory the server was LAUNCHED from, so this must run
// before the chdir below.
const absolute = (p) => (isAbsolute(p) ? resolve(p) : resolve(process.cwd(), p))

// ---- resolve the payload, or refuse ----
const requested = flag('payload') ?? process.env.DLS_PAYLOAD ?? null
if (!requested) {
  fail(
    'no payload given.',
    `  This server answers about ONE design system and will not guess which.
  The host decides this process's working directory, so the usual
  walk-up-from-cwd resolution cannot be trusted here.

  Pass it explicitly:

      npx 2one mcp --payload ./node_modules/@2one/design-library
      DLS_PAYLOAD=/path/to/design-system npx 2one mcp`,
  )
}

const payloadRoot = absolute(requested)
if (!existsSync(payloadRoot)) fail(`payload path does not exist: ${payloadRoot}`)

// ---- resolve the project, separately ----
const NODE_MODULES = `${sep}node_modules${sep}`
const requestedProject = flag('project') ?? process.env.DLS_PROJECT ?? null
/*
  indexOf, not lastIndexOf. pnpm nests the real package under
  node_modules/.pnpm/<name>@<version>/node_modules/, so the LAST node_modules is
  inside the store and only the FIRST belongs to the app.
*/
const projectRoot = requestedProject
  ? absolute(requestedProject)
  : payloadRoot.includes(NODE_MODULES)
    ? payloadRoot.slice(0, payloadRoot.indexOf(NODE_MODULES))
    : payloadRoot
if (!existsSync(projectRoot)) fail(`project path does not exist: ${projectRoot}`)

/*
  chdir before importing the engine. The engine resolves its payload from the
  working directory at import time, so this is what points it at the design
  system rather than wherever the host started us. One process serves one
  payload, which is exactly how the host config expresses it: one entry per
  project.
*/
process.chdir(payloadRoot)

const { CONFIG_FILE } = await import('./lib/config.mjs')
if (!existsSync(join(payloadRoot, CONFIG_FILE))) {
  fail(
    `no ${CONFIG_FILE} at ${payloadRoot}`,
    `  That file is how a payload tells the engine where its tokens, brand,
  components and rules live.

  Starting a new app on the 2one system? The design system ships inside the
  installed package, so point the payload there:

      --payload ./node_modules/@2one/design-library

  Onboarding an existing design-system repo instead? Generate the file with:

      npx 2one init ${payloadRoot}`,
  )
}

const { McpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js')
const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js')
const { z } = await import('zod')
const api = await import('./api.mjs')

const { checkUsage, ruleset, dlsInfo, decide, resolveNode, rulesFor, a11yFor, statesFor, alternativesFor, incompatibleWith, checkPair, graphSummary, config: cfg } = api

/*
  Every response says which design system it came from and which app it looked
  at. An agent holding answers from the wrong design system is the failure mode
  with no symptom, so provenance travels with the data rather than being
  available on request.
*/
const provenance = () => ({ payload: { name: cfg.name, root: cfg.root }, project: projectRoot })

const answer = (data) => ({
  content: [{ type: 'text', text: JSON.stringify({ ...provenance(), ...data }, null, 2) }],
})

const problem = (message, extra = {}) => ({
  isError: true,
  content: [{ type: 'text', text: JSON.stringify({ ...provenance(), error: message, ...extra }, null, 2) }],
})

/*
  The engine reports finding paths relative to the PAYLOAD root. For a client
  that turns their own src/App.tsx into ../../../src/App.tsx, a path that climbs
  out of node_modules and back down again. Re-anchor each finding on the project
  so it names the file the way the person reading it would. Inside the
  design-system repo both roots are one folder and this changes nothing.
*/
const onProject = (f) => ({ ...f, file: relative(projectRoot, resolve(cfg.root, f.file)).split(sep).join('/') })

const server = new McpServer({ name: '2one-dls', version: '0.2.0' })

// ---- what is installed, and how do I import it ----
server.registerTool(
  'dls_info',
  {
    title: 'Design system state',
    description:
      'Report the live state of the app being built: whether the design system is installed, the exact import statement to use, which framework and Tailwind version were detected, the component list, and anything misconfigured. Everything is observed from the project, never assumed. Call this first when you do not know what is available.',
    inputSchema: {},
  },
  async () => answer({ info: dlsInfo({ cwd: projectRoot }) }),
)

// ---- does this code conform ----
server.registerTool(
  'dls_check',
  {
    title: 'Audit code against the rules',
    description:
      'Audit files or directories in the app against this design system\'s rules. Returns each finding with the file, line, the detector that fired, the authored rule it enforces, and why the rule exists. Run this after writing or editing UI code and fix what it reports. Findings the design system has examined and accepted come back separately under "known" and are not failures.',
    inputSchema: {
      paths: z.array(z.string()).min(1).describe('Files or directories to audit, relative to the project root or absolute.'),
      includeWarnings: z.boolean().optional().describe('Include warning-severity findings in full. Their count is always reported.'),
    },
  },
  async ({ paths, includeWarnings = true }) => {
    const r = checkUsage({ targets: paths, cwd: projectRoot })
    if (!r.ok) return problem(r.error.message, { code: r.error.code, scannedLabel: r.scannedLabel })
    const warnings = r.warnings.map(onProject)
    return answer({
      scanned: r.scanned,
      conforms: r.errors.length === 0,
      errors: r.errors.map(onProject),
      warnings: includeWarnings ? warnings : warnings.length,
      known: r.known.map(onProject),
      drift: r.drift,
      coverage: r.coverage,
      caveat:
        'STATIC check. A clean result does not cover sizing, proportion or visual consistency, and nothing was rendered. Advisory rules in coverage.advisory are not mechanically checked at all.',
    })
  },
)

// ---- what does this system require ----
server.registerTool(
  'dls_rules',
  {
    title: 'The rule set',
    description:
      'What this design system requires of code: every mechanically checked rule with its severity and rationale, plus which authored rules are advisory (written but not checked) and which are discharged globally. Use this to understand the constraints before generating, rather than guessing them from examples.',
    inputSchema: {},
  },
  async () => answer({ ruleset }),
)

// ---- what should I build ----
server.registerTool(
  'dls_decide',
  {
    title: 'What to build for an intent',
    description:
      'Ask the knowledge graph what to use for a design intent, and why. Returns the decision, the components involved, the mandatory rules that govern it, and the evidence behind the recommendation. Intents can be given by id or by label.',
    inputSchema: {
      intent: z.string().min(1).describe('The intent to resolve, by id or human label, e.g. "confirm a destructive action".'),
    },
  },
  async ({ intent }) => {
    const d = decide(intent)
    if (!d || d.error) {
      return problem(d?.error ?? `no decision found for "${intent}"`, {
        known_intents: graphSummary.intents.map((i) => ({ id: i.id, label: i.label })),
      })
    }
    return answer({ decision: d })
  },
)

// ---- tell me about one component ----
server.registerTool(
  'dls_component',
  {
    title: 'Component contract',
    description:
      'Everything the graph knows about one component: the states it must implement, its accessibility requirements, the rules that govern it, what it can be substituted for, and what it must not be combined with. Use this before hand-rolling anything that resembles an existing component.',
    inputSchema: {
      name: z.string().min(1).describe('Component name or graph node id, e.g. "Button" or "component:button".'),
    },
  },
  async ({ name }) => {
    const id = resolveNode(name)
    if (!id) {
      return problem(`no component or node matching "${name}"`, {
        hint: 'Call dls_info for the component list, or dls_rules for the rule set.',
      })
    }
    return answer({
      component: {
        id,
        states: statesFor(id),
        accessibility: a11yFor(id),
        rules: rulesFor(id),
        alternatives: alternativesFor(id),
        incompatible_with: incompatibleWith(id),
      },
    })
  },
)

// ---- are these two things allowed together ----
server.registerTool(
  'dls_check_pair',
  {
    title: 'Are two things compatible',
    description:
      'Ask whether two components or tokens may be used together, and which rules decide it. Returns a YES / NO / UNSPECIFIED verdict with the relations and governing rules behind it, so an UNSPECIFIED answer is distinguishable from an allowed one.',
    inputSchema: {
      a: z.string().min(1).describe('First component or token, by name or id.'),
      b: z.string().min(1).describe('Second component or token, by name or id.'),
    },
  },
  async ({ a, b }) => answer({ pair: checkPair(a, b) }),
)

// ---- the exact values, never invented ----
server.registerTool(
  'dls_tokens',
  {
    title: 'Design token values',
    description:
      'The exact colour, typography and spacing values this system defines. Always read values from here rather than inventing or approximating them: an invented hex or size is the most common way generated UI drifts from a design system.',
    inputSchema: {
      group: z.enum(['colors', 'typography', 'spacing', 'all']).optional().describe('Which token group to return. Defaults to all.'),
    },
  },
  async ({ group = 'all' }) => {
    const dir = cfg.rel('out.tokens')
    if (!dir) return problem('this payload declares no generated token directory (paths.out.tokens)')
    const groups = group === 'all' ? ['colors', 'typography', 'spacing'] : [group]
    const tokens = {}
    const missing = []
    for (const g of groups) {
      const file = join(cfg.root, dir, `${g}.json`)
      if (!existsSync(file)) { missing.push(`${dir}/${g}.json`); continue }
      try { tokens[g] = JSON.parse(readFileSync(file, 'utf8')) } catch (e) { missing.push(`${dir}/${g}.json (${e.message})`) }
    }
    if (!Object.keys(tokens).length) {
      return problem('no token files could be read', { looked_for: missing, hint: 'Run the payload\'s token build, e.g. npm run build:meta.' })
    }
    return answer({ tokens, ...(missing.length ? { unreadable: missing } : {}) })
  },
)

/*
  Startup goes to stderr, which the host shows in its MCP logs. It is the only
  place that names the resolved payload and project before any tool is called,
  which is what makes a misconfigured path obvious rather than silent.
*/
console.error(`  2one mcp — serving "${cfg.name}" from ${cfg.root}`)
if (projectRoot !== payloadRoot) console.error(`  for the app at ${projectRoot}`)

await server.connect(new StdioServerTransport())
