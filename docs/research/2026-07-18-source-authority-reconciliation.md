# Research: source authority reconciliation

Date: 2026-07-18
Ticket: [T269](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/269-source-authority-reconciliation.md)

## Question

Can the project materialize a real selected-file delta between normative
IKEMEN revision `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703` and local cache
`044da72008b8ba13caf7b0f820526ce16e955fb3` without changing either checkout?

## Primary sources and audit inputs

- [Official IKEMEN-GO normative commit](https://github.com/ikemen-engine/Ikemen-GO/commit/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703)
  was fetched into the ignored audit clone
  `.scratch/external/Ikemen-GO-normative-audit`.
- Local cache: `.scratch/external/Ikemen-GO`, commit
  `044da72008b8ba13caf7b0f820526ce16e955fb3`.
- Existing source contract: `src/mugen/compatibility/SourceAuthorityManifest.ts`.

## Findings

The normative commit object was missing from the local cache, so the previous
manifest model could describe a comparison but could not produce a real one.
The separate official audit clone now provides the object without modifying the
local cache.

The selected authority files are `src/input.go`, `src/char.go`,
`src/bytecode.go`, `src/compiler.go`, `src/config.go`, `src/system.go`,
`src/state.go`, `src/script.go`, and `src/main.go`. Byte digests show three
equal files (`input.go`, `compiler.go`, `state.go`) and six changed files
(`char.go`, `bytecode.go`, `config.go`, `system.go`, `script.go`, `main.go`).

The local cache working tree is dirty because it contains untracked
`compiler.go`, `compiler_functions.go`, `script.go`, and `stage.go` at its root.
That dirtiness must keep the manifest comparison `incomplete` even when a
selected file's bytes match.

## Decision

Implement a repository script that accepts explicit normative/local Git roots,
reads selected Git objects plus local working-tree bytes, derives the manifest
delta, records dirty paths, and fails closed on missing normative objects or
files. The output uses no absolute paths and leaves semantic review
`unclassified`.

## Uncertainty

The six changed files are byte-level findings only. They do not identify which
changes are behaviorally relevant. Full repository-wide semantic review,
generated code/config parity, and ZSS/Lua/Modules remain open.

## Implementation outcome

`scripts/materialize_source_authority_manifest.cjs` now reads the normative
Git blobs and local working-tree bytes for the nine selected `src/*.go` files,
records local Git dirtiness, and writes the tracked artifact
`docs/evidence/source-authority-manifest-v0.json`. The real comparison is
normative `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703` versus local
`044da72008b8ba13caf7b0f820526ce16e955fb3`: three files are byte-identical,
six differ, and four pre-existing untracked local files keep the cache dirty.
The artifact digest is
`20216fe3f7031af71fd43af8ca1e918037cea9a23eb8a642cb8c2085442ff79b`.

The materializer fails closed when either Git root, revision, or required
normative blob is unavailable. It does not mutate either checkout. Semantic
review remains `unclassified`; this cut proves transport-level identity and
delta only. Implementation commit: `0d4a0274`.

## Verification

- `pnpm materialize:source-authority` passed against the real normative audit
  clone and local cache.
- `pnpm exec vitest run src/tests/SourceAuthorityManifest.test.ts --reporter=dot`
  passed: `1` file / `7` tests.
- `node --check scripts/materialize_source_authority_manifest.cjs`,
  `pnpm typecheck`, `pnpm check:boundaries`, and
  `pnpm check:redirect-boundary` passed.
- Browser smoke is N/A: no visible runtime or Studio surface changed.

## Next action

Materializer and artifact are complete in `0d4a0274`; close T269 while keeping
semantic review and compatibility-score movement open.
