/*
  Contract tests for the MCP server, driven over REAL stdio with the real SDK
  client. Not a mock of the protocol: the server is spawned as a child process
  exactly as a host spawns it, so framing errors and stray stdout writes fail
  here the way they would in Claude Desktop.

  Four things are worth testing beyond "the tools return something":

    1. stdout is clean. stdout IS the transport, so one console.log anywhere in
       the engine corrupts the stream and the host reports a parse error rather
       than a bug. Every successful call below is evidence of this, because a
       polluted stream would break the handshake before any of them ran.
    2. the payload is never guessed. Starting with no payload must fail, and
       starting against a directory with no config must fail, because a server
       that silently answers about the wrong design system has no symptom.
    3. provenance travels with the data. Every response names the design system
       it came from and the app it looked at.
    4. a new client works. The design system installed in node_modules and the
       client's code in their own src/ are different folders, and the server
       must not confuse them. It did, until a real install showed it.

  Run: npm run check:mcp
*/
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const here = dirname(fileURLToPath(import.meta.url))
const SERVER = join(here, 'mcp.mjs')
const PAYLOAD = join(here, '..')

const fails = []
const t = (name, ok) => { if (!ok) fails.push(name) }

// ---- it refuses to guess ----
const noPayload = spawnSync(process.execPath, [SERVER], { encoding: 'utf8', cwd: tmpdir() })
t('mcp: refuses to start with no payload', noPayload.status === 1)
t('mcp: says why it refused', /no payload given/.test(noPayload.stderr))
t('mcp: refusal writes nothing to stdout', noPayload.stdout === '')

const empty = mkdtempSync(join(tmpdir(), '2one-mcp-'))
try {
  const noConfig = spawnSync(process.execPath, [SERVER, '--payload', empty], { encoding: 'utf8', cwd: tmpdir() })
  t('mcp: refuses a directory with no payload config', noConfig.status === 1)
  t('mcp: names the missing config', /dls\.config\.json/.test(noConfig.stderr))

  const missingDir = spawnSync(process.execPath, [SERVER, '--payload', join(empty, 'nope')], { encoding: 'utf8', cwd: tmpdir() })
  t('mcp: refuses a path that does not exist', missingDir.status === 1)

  const missingProject = spawnSync(process.execPath, [SERVER, '--payload', PAYLOAD, '--project', join(empty, 'nope')], { encoding: 'utf8', cwd: tmpdir() })
  t('mcp: refuses a project path that does not exist', missingProject.status === 1 && /project path does not exist/.test(missingProject.stderr))
} finally {
  rmSync(empty, { recursive: true, force: true })
}

// ---- it serves the payload it was pointed at ----
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [SERVER, '--payload', PAYLOAD],
  stderr: 'pipe',
})
const client = new Client({ name: '2one-mcp-contract', version: '1.0.0' })
await client.connect(transport)

const call = async (name, args = {}) => {
  const r = await client.callTool({ name, arguments: args })
  const text = r.content.map((c) => c.text).join('')
  let parsed = null
  try { parsed = JSON.parse(text) } catch { /* assertions below fail */ }
  return { isError: Boolean(r.isError), parsed }
}

const listed = await client.listTools()
const names = listed.tools.map((tool) => tool.name).sort()
const EXPECTED = ['dls_check', 'dls_check_pair', 'dls_component', 'dls_decide', 'dls_info', 'dls_rules', 'dls_tokens']
t('mcp: advertises every tool', EXPECTED.every((n) => names.includes(n)))
t('mcp: every tool carries a description', listed.tools.every((tool) => typeof tool.description === 'string' && tool.description.length > 40))

const info = await call('dls_info')
t('dls_info: answers', info.parsed?.info?.dls?.installed === true)
t('dls_info: reports the component count', typeof info.parsed?.info?.components?.count === 'number')

const rules = await call('dls_rules')
t('dls_rules: lists checked detectors', (rules.parsed?.ruleset?.checked?.length ?? 0) > 0)
t('dls_rules: distinguishes advisory rules', Array.isArray(rules.parsed?.ruleset?.coverage?.advisory))

// The dialog carries this payload's one accepted finding, so this exercises the
// known-findings path through the protocol rather than only the happy one.
const chk = await call('dls_check', { paths: ['src/components/ui/dialog.tsx'] })
t('dls_check: audits a real file', chk.parsed?.scanned === 1)
t('dls_check: reports conformance', chk.parsed?.conforms === true)
t('dls_check: surfaces accepted findings separately', (chk.parsed?.known?.length ?? 0) === 1)
t('dls_check: carries the static caveat', /STATIC/.test(chk.parsed?.caveat ?? ''))

const badPath = await call('dls_check', { paths: ['does/not/exist'] })
t('dls_check: a bad path is an error result, not a crash', badPath.isError === true)

const toks = await call('dls_tokens', { group: 'spacing' })
t('dls_tokens: returns the requested group', Boolean(toks.parsed?.tokens?.spacing))
const allToks = await call('dls_tokens')
t('dls_tokens: defaults to every group', Object.keys(allToks.parsed?.tokens ?? {}).length >= 2)

const comp = await call('dls_component', { name: 'Button' })
t('dls_component: resolves a name to a node', typeof comp.parsed?.component?.id === 'string')
t('dls_component: returns the contract', Array.isArray(comp.parsed?.component?.rules))

const noComp = await call('dls_component', { name: 'zzz-no-such-component' })
t('dls_component: unknown name is an error result', noComp.isError === true)

const intent = rules.parsed && (await call('dls_decide', { intent: 'zzz-no-such-intent' }))
t('dls_decide: unknown intent is an error result', intent.isError === true)
t('dls_decide: unknown intent lists the real intents', Array.isArray(intent.parsed?.known_intents))

const pair = await call('dls_check_pair', { a: 'Button', b: 'Button' })
t('dls_check_pair: returns a known verdict', ['YES', 'NO', 'UNSPECIFIED'].includes(pair.parsed?.pair?.verdict))

// ---- provenance on everything ----
const all = [info, rules, chk, toks, allToks, comp, pair, badPath, noComp, intent]
t('mcp: every response names the payload it answered about', all.every((r) => typeof r.parsed?.payload?.name === 'string'))
t('mcp: every response names the payload root', all.every((r) => typeof r.parsed?.payload?.root === 'string'))
t('mcp: every response names the project it looked at', all.every((r) => typeof r.parsed?.project === 'string'))

await client.close()

// ---- a new client: design system in node_modules, their own code in src/ ----
/*
  The case the first version got wrong. A client installs the package, so the
  design system lives in node_modules/@2one/design-library while their code
  lives in the app around it. The server used one root for both: it told the
  client they were "inside the 2one repo", handed them an @/ import that does
  not resolve in their app, and looked for src/App.tsx inside the package.

  Built as a real layout rather than mocked. The payload is COPIED into place,
  never linked: a recursive delete that followed a directory link during cleanup
  would remove the repository itself. Only what npm installs is copied, minus
  the engine code, which the server under test brings with it.
*/
const pkg = JSON.parse(readFileSync(join(PAYLOAD, 'package.json'), 'utf8'))
const app = mkdtempSync(join(tmpdir(), '2one-mcp-client-'))
try {
  const installed = join(app, 'node_modules', '@2one', 'design-library')
  mkdirSync(installed, { recursive: true })
  cpSync(join(PAYLOAD, 'package.json'), join(installed, 'package.json'))
  for (const entry of pkg.files) {
    if (entry === 'scripts' || entry === 'skills' || entry === 'dist') continue
    const from = join(PAYLOAD, entry)
    if (existsSync(from)) cpSync(from, join(installed, entry), { recursive: true })
  }
  // dls_info reads a client's component list from the built type declarations.
  const types = join(PAYLOAD, 'dist', 'index.d.ts')
  if (existsSync(types)) {
    mkdirSync(join(installed, 'dist'), { recursive: true })
    cpSync(types, join(installed, 'dist', 'index.d.ts'))
  }

  writeFileSync(join(app, 'package.json'), JSON.stringify({ name: 'acme-contract', private: true }) + '\n')
  mkdirSync(join(app, 'src'), { recursive: true })
  // `bg-blue-500` is outside the palette, so a working check must report it.
  writeFileSync(join(app, 'src', 'App.tsx'), 'export default function App() {\n  return <div className="bg-blue-500">acme</div>\n}\n')

  const fresh = new Client({ name: '2one-mcp-fresh-client', version: '1.0.0' })
  await fresh.connect(new StdioClientTransport({
    command: process.execPath,
    args: [SERVER, '--payload', installed],
    stderr: 'pipe',
  }))
  const ask = async (name, args = {}) => {
    const r = await fresh.callTool({ name, arguments: args })
    let parsed = null
    try { parsed = JSON.parse(r.content.map((c) => c.text).join('')) } catch { /* assertions below fail */ }
    return { isError: Boolean(r.isError), parsed }
  }

  const freshInfo = await ask('dls_info')
  t('client: the project is derived as the app that owns node_modules', freshInfo.parsed?.project === app)
  t('client: dls_info reports a consuming project, not the design-system repo', /consuming project/.test(freshInfo.parsed?.info?.dls?.context ?? ''))
  t('client: dls_info gives the package import, not an @/ source path', (freshInfo.parsed?.info?.dls?.import ?? '').includes("from '@2one/design-library'"))

  const freshCheck = await ask('dls_check', { paths: ['src/App.tsx'] })
  const freshErrors = freshCheck.parsed?.errors ?? []
  t('client: a relative path resolves against the app, not the package', freshCheck.isError === false && freshCheck.parsed?.scanned === 1)
  t('client: the violation in the app is found', freshErrors.some((e) => e.rule === 'foreign-palette'))
  t('client: findings are named from the app root', freshErrors.length > 0 && freshErrors.every((e) => e.file === 'src/App.tsx'))

  await fresh.close()
} finally {
  rmSync(app, { recursive: true, force: true })
}

if (fails.length) {
  console.error(`\n  ✗ check:mcp — ${fails.length} contract(s) broken:\n`)
  for (const f of fails) console.error(`    · ${f}`)
  console.error('\n  The server is what an LLM host talks to. A broken contract here is a')
  console.error('  wrong answer about someone\'s design system, delivered confidently.\n')
  process.exit(1)
}
console.log('\n  ✓ check:mcp — refuses to guess, answers over real stdio, names its source, and works for a client with the design system in node_modules\n')
