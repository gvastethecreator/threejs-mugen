# Implement Studio SourceWriteReceipt/v0

Date: 2026-07-16
Status: resolved at bounded scope
Depends on: Wayfinder 224
Implementation commit: `653a1e2c`

## Outcome

Studio now materializes the outcome of a real directory-backed CNS/ST source
write as a parser-validated `SourceWriteReceipt/v0`. The receipt is recorded
for semantic preflight blocks, plan/permission blocks, project conflicts,
source identity changes, write failures, rejected reimports, and committed
write-and-reimport operations.

## Contract

`SourceWriteReceipt/v0` carries:

- source package identity, source path, operation, status, and reason;
- permission, project revision, source fingerprints, source byte length, and
  semantic draft/committed digests when available;
- invalidated output names and human-readable diagnostics;
- deterministic `fnv1a32` transport integrity over the normalized payload.

Committed status is fail-closed: the receipt must carry both a committed
source fingerprint and a committed semantic digest. Tampered receipts,
invalid optional fields, missing digests, and malformed status/reason values
are rejected by the parser.

## Studio integration

- Source editor exposes the latest receipt beside semantic preflight status.
- Evidence adds a `source` category and derives exportability from the
  receipt predicate.
- Build Readiness and Trust Chain expose a conditional source-write row with
  source-file targeting and digest detail.
- ZIP export includes `studio/source-write-receipt.json` as a required file
  whenever the current session has a source-write receipt.
- Rollback state and the browser QA bridge preserve the receipt across source
  import transaction boundaries.

## Evidence

- `src/tests/StudioSourceWriteReceipt.test.ts`: 6/6 contract tests passed.
- `pnpm typecheck`: passed under TypeScript 7.
- `pnpm run build`: passed; Vite emitted the existing large-chunk warning.
- `pnpm run qa:smoke`: passed in 319 seconds after the focused QA assertions
  were corrected for the canonical VFS-rooted source path and the existing
  generated-asset filter race was synchronized. The final run covered the
  real folder handle, invalid and valid CNS edits, exclusive write,
  explicit reimport, Evidence, Trust Chain, package export, runtime, desktop
  and mobile Studio surfaces, with 0 console errors and 0 page errors.

Artifacts:

- `.scratch/qa/qa-smoke/diagnostics.json`
- `.scratch/qa/qa-smoke/studio-source-write-package.zip`
- `.scratch/qa/qa-smoke/studio-source-folder-handle.png`

The final browser record was `committed / write-and-reimport`; Evidence was
`ok`, Trust Chain was `exportable`, and the exported ZIP contained the
required `mugen-web-sandbox/source-write-receipt/v0` document.

## Audit

The first full browser run showed the implementation path itself was green,
but the test expected a source path without the VFS root. The second run then
exposed an unrelated Asset Library filter race; the QA harness now waits for
the internal `generated` filter state while preserving all behavioral
assertions. The fourth full run passed without weakening the receipt checks.

## Claim ceiling

This closes receipt materialization for the existing directory-exclusive
source editor path. It does not implement ZIP archive rewrite, background
handle reacquisition, external engine parity, full MUGEN/IKEMEN compatibility,
or the shared Evidence contract. The next product lane is an independent
package/asset analysis contract before shared evidence extraction.
