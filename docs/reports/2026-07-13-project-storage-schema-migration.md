# Project Storage Schema Migration

Date: 2026-07-13

## Closure

The browser-local Studio project index now reads legacy
`mugen-web-sandbox/project-index/v0` data, normalizes valid entries with
`revision: 1`, and writes the migrated payload as
`mugen-web-sandbox/project-index/v1` under the existing storage key. Replacing
an existing project increments its revision. If the browser refuses the
migration write, the current read still returns valid entries; explicit saves
continue to surface storage failures.

The decision is recorded in
`docs/research/2026-07-13-project-storage-schema-and-conflict.md`, based on
MDN Web Storage and the WHATWG HTML Standard. The same note keeps storage
events and conflict UI as a separate transaction-boundary slice.

## Evidence

- Focused storage/history/autosave/navigation check: `12/12` tests passed.
- Full Vitest: `188/188` files, `1973/1973` tests passed.
- TypeScript 7 typecheck: passed.
- Boundary check: passed.
- Production build: passed; JS output `1,669.13 kB` minified (`419.26 kB`
  gzip), with the existing large-chunk advisory.
- Runtime traces: `581/581` artifacts passed (`547` required, `34` optional),
  with no skipped optional fixtures.
- Playwright smoke: passed across desktop/mobile runtime, imported fixture
  flows, Code Fu Man routes, Studio authoring, and persisted local projects.

## Claim Ceiling

Allowed claim: backward-compatible v0 -> v1 migration and per-project
revision metadata for the current local project index.

Still blocked: same-origin external-tab detection, optimistic write rejection,
conflict presentation/resolution, IndexedDB or File System Access persistence,
source writes, and full MUGEN/IKEMEN parity.
