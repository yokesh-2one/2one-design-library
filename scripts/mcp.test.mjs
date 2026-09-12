/*
  Contract tests for the MCP server, driven over REAL stdio with the real SDK
  client. Not a mock of the protocol: the server is spawned as a child process
  exactly as a host spawns it, so framing errors and stray stdout writes fail
  here the way they would in Claude Desktop.

  Three things are worth testing beyond "the tools return something":

    1. stdout is clean. stdout IS the transport, so one console.log anywhere in
       the engine corrupts the stream and the host reports a parse error rather
       than a bug. Every successful call below is evidence of this, because a
       polluted stream would break the handshake before any of them ran.
    2. the payload is never guessed. Starting with no payload must fail, and
       starting against a directory with no config must fail, because a server
       that silently answers about the wrong design system has no symptom.
    3. provenance travels with the data. Every payload-bearing response names
       the system it came from.

  Run: npm run check:mcp
*/
import { mkdtempSync, rmSync } from 'node:fs'
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

await client.close()

if (fails.length) {
  console.error(`\n  ✗ check:mcp — ${fails.length} contract(s) broken:\n`)
  for (const f of fails) console.error(`    · ${f}`)
  console.error('\n  The server is what an LLM host talks to. A broken contract here is a')
  console.error('  wrong answer about someone\'s design system, delivered confidently.\n')
  process.exit(1)
}
console.log('\n  ✓ check:mcp — server refuses to guess a payload, answers over real stdio, and names its source on every response\n')
