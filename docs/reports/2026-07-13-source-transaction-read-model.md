# SourceTransaction/v0 Read Model Report

Date: 2026-07-13
Status: closed with grouped verification

## Scope

Studio now exposes a deterministic source transaction record for every imported
source package. The record separates readable session bytes from durable write
capability, elevates project revision drift to a conflict, and names the next
repair action before a future source editor is allowed to write.

## Contract

- `linked` is usable only when the package is linked and its saved identity is
  not missing.
- `changed` requires an explicit source reimport.
- `missing` requires a relink before source bytes can be consumed.
- `conflict` wins over source permission and blocks writes until the project
  revision is resolved.
- `canRead` describes the current browser session; `canWrite` requires linked
  source, granted permission, and an equal observed project revision.
- Non-linked states invalidate runtime manifest, trace artifact, and project
  bundle outputs.
- The diagnostics bridge and Build Center expose schema, permission, state,
  revision, next action, and invalidation fields.

## Evidence

- Focused verification passes 3 files / 23 tests across the transaction,
  identity, and source-model contracts.
- Full verification passes 190 files / 1985 tests, TypeScript 7, module
  boundaries, CSS budget, script syntax, and diff checks.
- Production build passes at `1,685.38 kB` JavaScript / `423.41 kB` gzip with
  the existing large-chunk advisory.
- `pnpm qa:trace` passes 581/581 artifacts: 547 required and 34 optional,
  with 0 skipped optional fixtures.
- `pnpm qa:smoke` passes in 202.5 seconds with 0 page errors and 0 console
  issues. The browser proves the real relink record as
  `linked / not-requested / canRead=true / canWrite=false`, then proves a
  changed reimport as `rejected / changed-source` while the active record
  remains linked/matched and non-writable.
- Visual evidence is available at
  `.scratch/qa/qa-smoke/studio-source-relink-rejected.png`; the full bridge
  record is in `.scratch/qa/qa-smoke/diagnostics.json`.
- The grouped gate also exposed a ZIP input-buffer mutation in the loader;
  `14e0abf0` now copies the archive buffer before JSZip decoding and its
  journey regression passes.

## Claim Ceiling

Allowed: deterministic source transaction read state and UI/bridge evidence.

Blocked: durable file editing, handle reacquisition, permission prompts,
crash-safe external replacement, and full MUGEN/IKEMEN parity.

## Official References

- [W3C IndexedDB 3.0](https://www.w3.org/TR/IndexedDB/)
- [MDN `FileSystemFileHandle.createWritable()`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable)
- [File System Access API draft](https://wicg.github.io/file-system-access/)
