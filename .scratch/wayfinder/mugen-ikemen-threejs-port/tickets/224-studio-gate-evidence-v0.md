# Implement Studio GateEvidence/v0

Date: 2026-07-16
Status: resolved at bounded scope
Depends on: Wayfinder 223
Implementation commit: `c8145f54`

## Outcome

Studio now consumes a real repository-produced gate record instead of a
symbolic architecture green. The first producer is intentionally narrow:
`pnpm run materialize:studio:gate-evidence` executes
`pnpm run check:boundaries`, records the observed tool and source revision,
and writes the same parser-validated document to the tracked evidence path
and the application source mirror.

## Contract

`GateEvidenceResult/v0` carries:

- gate identity, label, status, intent, command, and tool/version;
- observation time, source revision, declared freshness, and diagnostics;
- a typed target and deterministic `fnv1a32` transport digest.

Studio validates the document before consumption. Missing, invalid, tampered,
failed, unsupported, stale, or diagnostic-only observations fail closed for
release export. Build readiness, Evidence, and the shared Trust Chain derive
their architecture status from the same result. Project ZIP exports include
`studio/gate-evidence.json` as a required manifest file.

## Evidence

- `src/tests/GateEvidence.test.ts`: 6/6 contract tests passed.
- `pnpm typecheck`: passed under TypeScript 7.
- `pnpm run build`: passed; Vite emitted the existing large-chunk warning.
- `pnpm run qa:studio:gate-evidence`: passed; Build and Evidence shared
  digest `fnv1a32:c4be5cf8`, Trust Chain was `current/exportable`, ZIP schema
  was `mugen-web-sandbox/gate-evidence/v0`, and desktop/mobile had no
  console/page errors or horizontal overflow.
- `pnpm run qa:studio:compatibility-snapshot`: passed; the package carried
  both the promoted compatibility snapshot and required GateEvidence file.
- Broad `pnpm run qa:smoke`: the new GateEvidence checks were reached without
  failure, but the run later timed out in
  `captureStudioProjectStorageConflict` while reopening the stored project.
  This is recorded as an existing Workbench QA follow-up, not as a green
  broad-run claim for this feature.

Artifacts:

- `docs/evidence/studio-gate-evidence-v0.json`
- `.scratch/qa/studio-gate-evidence/browser-diagnostics.json`
- `.scratch/qa/studio-gate-evidence/studio-build-gate-evidence.png`
- `.scratch/qa/studio-gate-evidence/studio-evidence-gate-evidence.png`
- `.scratch/qa/studio-gate-evidence/studio-evidence-gate-evidence-mobile.png`

## Audit

The first browser pass exposed a test expectation mismatch: the UI command is
`pnpm run check:boundaries`, while the producer tool is
`check_boundaries.cjs`; the final detail exposes both. The package target is
the evidence record `test:architecture-boundaries`; Trust Chain renders its
kind-prefixed target separately. The second browser pass confirmed that the
application and exported ZIP use the same digest and target.

## Claim ceiling

This closes one app-owned release-intent gate contract. It does not make all
Studio gates CLI-backed, does not prove source writes or filesystem
persistence, and does not claim complete MUGEN/IKEMEN parity or release
readiness. The next evidence contract is `SourceWriteReceipt/v0`, followed by
additional independently-produced gate records.
