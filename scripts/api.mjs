/*
  The engine's public library surface.

  Three scripts grew entry points so an embedder could call the engine instead of
  spawning it. That was necessary and not sufficient: `exports` in package.json
  maps `./*` to `./dist/*`, so `@2one/design-library/scripts/check-usage.mjs`
  resolved to a file under dist that does not exist. Every entry point was
  reachable only by absolute path on disk, which is no use to anything installed
  from a package.

  This module is the one importable name, and package.json publishes it as
  `@2one/design-library/api`:

      import { checkUsage, dlsInfo, decide } from '@2one/design-library/api'

  Going through a facade also means the script filenames stay internal. A caller
  binds to `checkUsage`, not to `scripts/check-usage.mjs`, so the layout can move
  without breaking anyone.

  Importing this is inert. It reads the payload's graph, rules and config, and it
  prints nothing, exits nothing, and scans nothing until it is called. That
  property is asserted in engine-api.test.mjs and is easy to break by accident,
  so it is worth stating here as a contract rather than an accident.

  What this is NOT: a stable semver'd API. The payload is `private: true` and
  consumers install from a git ref, so the shape here moves with the repo. It is
  a seam for tools built alongside this system, not a published contract.
*/

/*
  Audit code against the payload's rules. Returns findings; input failures come
  back as `ok: false` with a typed error rather than exiting the host.
*/
export { checkUsage, ruleset } from './check-usage.mjs'

/*
  Report the live state of a project: what is installed, how to import it, what
  is misconfigured. Takes the project to inspect as an argument.
*/
export { dlsInfo } from './dls-info.mjs'

/*
  Ask the knowledge graph what to build and why. `decide` is the entry most
  worth exposing to an agent; the rest answer narrower questions about one node
  or one pair of nodes. An unresolvable query returns an `error` field.
*/
export {
  decide,
  resolveNode,
  rulesFor,
  a11yFor,
  statesFor,
  alternativesFor,
  incompatibleWith,
  checkPair,
  edgesBetween,
  labelOf,
  graphSummary,
} from './graph-decide.mjs'

/*
  Which payload the engine resolved, and where. An embedder should be able to
  report what it is answering ABOUT before it answers anything, since the
  payload is found by walking up from the working directory and a caller can
  easily be pointed at one it did not expect.
*/
export { config } from './lib/config.mjs'
