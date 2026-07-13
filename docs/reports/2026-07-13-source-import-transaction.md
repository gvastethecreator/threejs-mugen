# Source Import Transaction Report

Date: 2026-07-13
Status: closed with grouped verification

## Scope

Studio now separates source-package admission from active-session mutation. A
source import is planned against the current manifest before `useCharacter`
can replace the runtime, provider routes, audio archive, stages, inspector, or
project source metadata. Changed or unmatched source bytes are rejected while
the current runtime/source session remains active.

## Contract

- `prepareSourceImportTransaction` is a pure admission plan with explicit
  `accepted` or `rejected` status and a reason.
- Matching relinks are accepted; legacy manifests establish their first
  fingerprint baseline only through an explicit relink.
- Changed fingerprints and missing required paths remain rejected and expose
  observed source metadata for repair UI.
- `runSourceImportTransaction` commits the session through one callback and
  invokes rollback with the captured state if that callback throws.
- The browser UI exposes a rejected reimport notice and keeps the current
  source package linked/matched for export and runtime inspection.
- Durable source writes, file handles, and automatic reacquire remain outside
  this transaction. They require their own permission, replacement, and
  recovery protocol.

## Evidence

- Focused verification passes 3 files / 19 tests across transaction, identity,
  and source-model contracts.
- Full verification passes 190 files / 1981 tests, TypeScript 7, module
  boundaries, and the CSS budget.
- Production build passes at `1,682.34 kB` JavaScript / `422.57 kB` gzip with
  the existing large-chunk advisory.
- `pnpm qa:trace` passes 581/581 artifacts: 547 required and 34 optional, with
  no skipped optional fixtures.
- `pnpm typecheck` passes with the TypeScript 7 toolchain.
- `node --check scripts/qa_smoke.cjs` and `git diff --check` pass.
- `pnpm qa:smoke` passes with no page errors or console issues. The browser
  path proves `missing -> linked`, then changed bytes produce
  `rejected / changed-source` while the active package remains
  `linked / matched`; the transaction and current fingerprints differ.
- Visual evidence is available at
  `.scratch/qa/qa-smoke/studio-source-relink-rejected.png` and the complete
  bridge record at `.scratch/qa/qa-smoke/diagnostics.json`.

## Deliberate Non-Goals

IndexedDB project persistence, File System Access permissions, source file
replacement, crash recovery after a durable write, background reacquire,
streaming digest, and full MUGEN/IKEMEN runtime parity remain separate work.

## Official References

- [W3C IndexedDB 3.0](https://www.w3.org/TR/IndexedDB/)
- [MDN `FileSystemFileHandle.createWritable()`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable)
- [File System Access API draft](https://wicg.github.io/file-system-access/)
