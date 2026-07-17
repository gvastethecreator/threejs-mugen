# AssetReleasePolicy/v0 closeout

Date: 2026-07-16
Scope: T29 / Wayfinder 230

## Task state

Completed at bounded diagnostic scope.

## Artifact verdict

Win against the T29 acceptance target. Studio now emits a separate
`mugen-web-sandbox/asset-release-policy/v0` decision record. After export,
actual package hashes and a matching trace make Nova Boxer releasable. Other
records remain explicitly diagnostic-only.

## Changes

- Added `StudioAssetReleasePolicy/v0` with required evidence kinds,
  pass/warn/fail/unknown/stale states, freshness, canonical ordering, and
  fail-closed blockers.
- Integrated policy records into Studio Assets, Build Readiness, Trust Chain,
  diagnostics, project manifest, and required ZIP export.
- Added package-level assertions for one ready record, blocked records,
  schema, evidence kinds, digest/path consistency, and diagnostic export.
- Hardened the long smoke harness for metadata hydration and changed-frame
  selection so evidence checks validate behavior, not a fixed trace frame.

## Evidence

- Focused Vitest: 3 files, 13 tests passed.
- TypeScript 7 typecheck: passed.
- Node syntax and diff checks: passed; existing CRLF warnings only in unrelated
  dirty roadmap files.
- `pnpm run qa:smoke` final batch: passed in 398.9s.
- Browser/package proof: 0 page errors, 0 console issues, policy schema in ZIP,
  1 ready record, 9 diagnostic-only records, Nova `ready` and `canRelease`.
- Existing asset hygiene gate: 62 public text files, 13/13 declared digests,
  0 path violations.

## Audit and claim ceiling

The policy blocks unknown/stale evidence and keeps Nova's non-blocking motion
warning visible. No legal approval, commercial authorization, imported MUGEN
credit, IKEMEN execution, parity, or score movement is claimed.

## Next highest-leverage move

Revision-bind the policy artifact and design `EvidenceContract/v0` as a shared
consumer only when its source/artifact freshness semantics are explicit.
