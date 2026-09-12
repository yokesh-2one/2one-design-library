# Running and testing the MCP server

`npx 2one mcp` serves this design system to an LLM host over the Model Context
Protocol. This page is about **proving it works**, in increasing order of
fidelity: a health check, the automated contract suite, an interactive session,
and finally a real host.

Each rung tests something the one below it cannot. Start at the top when
something is broken; start at the bottom when you want to know it is right.

---

## What it is, in one paragraph

The host spawns the server as a child process and talks JSON-RPC over
stdin/stdout. One process serves one payload. Nothing listens on a port, nothing
leaves the machine. **stdout is the protocol**, so the server redirects
`console.log`/`info`/`debug` to stderr before loading anything else; a stray
print in the engine would otherwise corrupt the stream and the host would report
a parse error rather than a bug.

The payload is **never guessed**. The host decides the working directory, and it
is routinely the user's home folder, so the engine's usual walk-up-from-cwd
resolution cannot be trusted here. `--payload` or `DLS_PAYLOAD` is required and
an unresolvable one is a startup failure.

---

## 1. Health check

Closing stdin ends the transport cleanly, which makes the whole startup path a
one-liner:

```bash
node scripts/mcp.mjs --payload . < /dev/null
```

```
  2one mcp — serving "2one" from D:\...\2one-design-library
```

That line goes to **stderr**, which is where a host shows MCP logs. Read the
name: if it is not the system you meant, `DLS_PAYLOAD` is wrong and no tool call
will tell you more gently.

Exit code 0 and that one line is a pass. It proves the payload resolved, the
config parsed, the engine imported, and the transport opened and closed.

### The three refusals

Each should exit 1 with an explanation, not a stack trace:

```bash
node scripts/mcp.mjs                                  # no payload at all
node scripts/mcp.mjs --payload /tmp                   # a directory with no dls.config.json
node scripts/mcp.mjs --payload ./nowhere              # a path that does not exist
```

A refusal that prints to stdout would be a bug: the transport owns stdout even
when the server is failing.

---

## 2. The contract suite

```bash
npm run check:mcp
```

This spawns the real server as a child process and drives it with the MCP SDK's
own client, so protocol framing and stdout pollution fail here the way they
would in a host. It is part of `npm run verify`.

It asserts the seven tools are advertised with descriptions, the three refusals
above, that an unknown component or intent comes back as an **error result**
rather than crashing the process, and that every response — including the error
ones — names the payload it answered about.

### Proving the stdout guard

Worth doing once, because it shows both what the guard covers and what it
cannot. Add a module-scope print to any engine file, for example near the top of
`scripts/check-usage.mjs`:

```js
console.log('noise')        // check:mcp still passes — the guard redirects it
process.stdout.write('x\n') // check:mcp FAILS with "Connection closed"
```

The guard catches the console. It cannot catch a direct write to the stream, and
nothing can. Remove whichever you added afterwards.

---

## 3. Interactive: the MCP Inspector

The official interactive client. It opens a browser UI listing the tools, lets
you fill in arguments and see raw responses, which is the fastest way to explore
what the tools actually return:

```bash
npx @modelcontextprotocol/inspector node scripts/mcp.mjs --payload .
```

> Not verified in this repo — the command is the documented form for a stdio
> server and the server takes its payload as shown, but nobody here has run the
> Inspector against it yet. If it misbehaves, fall back to section 4, which has
> been run.

---

## 4. Interactive: a scratch client

When you want a specific answer rather than a UI. This has been run against this
server and works. The file must live **inside the repo** so it can resolve the
SDK:

```js
// scripts/.ask-tmp.mjs  (delete when done)
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const repo = process.cwd()
const transport = new StdioClientTransport({
  command: process.execPath,
  args: ['scripts/mcp.mjs', '--payload', repo],
  stderr: 'pipe',
})
const client = new Client({ name: 'ask', version: '1.0.0' })
await client.connect(transport)

console.error((await client.listTools()).tools.map((t) => t.name).join(', '))

const r = await client.callTool({ name: 'dls_info', arguments: {} })
console.error(r.content.map((c) => c.text).join(''))

await client.close()
```

```bash
node scripts/.ask-tmp.mjs
```

Write output to **stderr** (`console.error`) in scratch clients. The client's own
stdout is not the protocol, but keeping the habit means a script copied into the
server never corrupts anything.

---

## 5. A real host

The highest-fidelity test, and the only one that exercises the integration
rather than the protocol.

### Claude Desktop

`%APPDATA%\Claude\claude_desktop_config.json` on Windows,
`~/Library/Application Support/Claude/` on macOS:

```json
{
  "mcpServers": {
    "2one-dls": {
      "command": "node",
      "args": ["D:/path/to/2one-design-library/scripts/mcp.mjs"],
      "env": { "DLS_PAYLOAD": "D:/path/to/2one-design-library" }
    }
  }
}
```

Then **fully quit and reopen** the app. Reloading a window does not respawn the
server.

Forward slashes work on Windows and avoid the escaped-backslash mistakes that
make this file silently invalid. Paths with spaces are fine because each
argument is its own array element rather than a shell string.

`npx -y @2one/design-library mcp` does **not** work: this package is
`private: true` and deliberately unpublished, so npx resolves it against the
registry and gets a 404. Invoke it by path.

For a client who installed from git, the server is inside the package and the
payload is the project around it — two different paths, both required:

```json
{
  "command": "node",
  "args": ["/abs/path/to/their-app/node_modules/@2one/design-library/scripts/mcp.mjs"],
  "env": { "DLS_PAYLOAD": "/abs/path/to/their-app" }
}
```

### Claude Code

Project scope, so it lands in `.mcp.json` and the team gets it:

```bash
claude mcp add 2one-dls --scope project \
  --env DLS_PAYLOAD=$(pwd) \
  -- node ./scripts/mcp.mjs
```

### What to ask first

In order, because each proves a further link:

1. **"What design system is available here?"** — `dls_info`. Should name the
   system, the component count, and report it installed.
2. **"What rules do I have to follow?"** — `dls_rules`. Checked detectors, and
   separately the advisory rules nothing mechanically enforces.
3. **"Give me the exact brand accent."** — `dls_tokens`. Should read the token
   files rather than recall a hex from training.
4. **Write a component, then ask it to check the file** — `dls_check`. This is
   the loop the system exists for.

### When the tools do not appear

In order of likelihood:

| Symptom | Cause |
| --- | --- |
| No 2one tools at all | The app was reloaded, not fully restarted |
| No 2one tools, other servers fine | Invalid JSON in the config file |
| Server exits immediately | `node` on the app's PATH differs from the shell's. An nvm-managed install is the usual reason: a GUI app launched before an nvm switch inherits the old path. Use an absolute path to the node binary. |
| Tools appear, answers are wrong | `DLS_PAYLOAD` points at the wrong project. Every response carries `payload.name` and `payload.root` — read them. |

---

## 6. The test that matters most

Point it at a **different payload**:

```bash
node scripts/mcp.mjs --payload /path/to/another-design-system < /dev/null
```

Everything above proves the server works against the system it was written
alongside. Only this proves the engine/payload seam holds, which is the claim the
whole architecture rests on. `npm run check:seam` enforces that no payload paths
remain in engine code, but a passing static check is not the same as a working
run, and until a second payload has been served end to end that claim is
inference.

---

## The tools

| Tool | Answers |
| --- | --- |
| `dls_info` | What is installed, how to import it, what is misconfigured |
| `dls_check` | Does this code conform, with each finding's rule and rationale |
| `dls_rules` | What this system requires, and what is only advisory |
| `dls_decide` | What to build for an intent, and why |
| `dls_component` | One component's states, a11y, rules, alternatives, conflicts |
| `dls_check_pair` | May these two be used together, and which rule decides |
| `dls_tokens` | The exact values, so nothing has to be invented |

Six sit directly on functions exported from `@2one/design-library/api`;
`dls_tokens` is the only reader written for the server. See `scripts/api.mjs`.

---

## Related

- `docs/consuming.md` — installing the library in an app
- `scripts/mcp.mjs` — the server, with the reasoning in its header
- `scripts/mcp.test.mjs` — the contract suite
- `npm run check:api` — the library entry points the server is built on
