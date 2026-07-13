# Source Identity Fingerprint Report

Date: 2026-07-13
Status: closed with grouped verification

## Scope

Studio now has a bounded read model for distinguishing an unchanged source
relink from a changed or unavailable MUGEN package. The slice deliberately does
not claim filesystem persistence, automatic reacquire, source writes, or
rollback.

## Contract

- ZIP and folder imports fingerprint the normalized `VirtualFileSystem` using
  sorted paths, path/byte lengths, and file bytes.
- The digest is SHA-256 through Web Crypto and is stored as optional source
  package metadata with file count and byte length.
- Relink exposes `matched`, `changed`, `missing`, and `unknown` identity states.
- A changed fingerprint keeps the package unavailable for clean export and
  preserves the observed fingerprint for repair UI and later transaction work.
- Legacy manifests without a fingerprint remain `unknown` until an explicit
  relink establishes a new comparison baseline.

## Evidence

- Unit coverage proves insertion-order independence, byte sensitivity, status
  classification, legacy baseline establishment, and changed-source rejection.
- Browser smoke captures the Build Center relink path, the visible identity
  row, and the resulting 64-character fingerprint.
- Focused verification passes 2 files / 15 tests.
- Full verification passes 189 files / 1977 tests, TypeScript 7 typecheck,
  module boundaries, and the CSS budget.
- Production build passes at `1,676.71 kB` JavaScript / `421.33 kB` gzip with
  the existing large-chunk advisory.
- `pnpm qa:trace` passes 581/581 artifacts: 547 required and 34 optional, with
  no skipped optional fixtures.
- `pnpm qa:smoke` passes Runtime and Studio desktop/mobile paths. The source
  relink evidence is `missing -> linked`, identity `matched`, and a
  64-character SHA-256 fingerprint equal to its observed fingerprint.
- Browser artifacts remain available under
  `.scratch/qa/qa-smoke/diagnostics.json` and
  `.scratch/qa/qa-smoke/studio-source-relink.png`.

## Official References

- [MDN `SubtleCrypto.digest()`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)
- [MDN File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API)
- [MDN `FileReader.readAsArrayBuffer()`](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsArrayBuffer)

## Deliberate Non-Goals

IndexedDB, OPFS, File System Access handles, background reacquire, source
editing, reimport transactions, rollback, and large-source streaming remain
separate work. Web Crypto `digest()` currently materializes the bounded VFS
input, so existing import limits remain the memory policy.
