# EvidenceEnvelope/v0 closeout

Date: 2026-07-16
Scope: shared evidence facts / Wayfinder 232

## Task state

Completed as a contract and adapter slice. Studio UI/export integration remains
the next bounded task.

## Artifact verdict

Win against the contract acceptance target. GateEvidence and PackageAnalysis/v1
now have adapters into one facts-only envelope shape with separate source and
producer revisions, provenance IDs, derivation, observation freshness, semantic
digest, artifact SHA-256, canonicalization profile, and envelope SHA-256.

## Changes

- Added `src/app/EvidenceEnvelope.ts` with `evidence-envelope/v0`,
  `stable-json/v0`, fail-closed parser, deterministic canonicalizer, and
  browser-safe SHA-256 implementation.
- Added GateEvidence and PackageAnalysis/v1 adapters. Both require callers to
  provide producer revision, freshness state, and artifact identity.
- Kept AssetReleasePolicy outside the shared envelope; no `canRelease`, score,
  parity, or aggregate readiness field exists.
- Added deterministic order, SHA-256 known-vector, tamper, deletion, and
  adapter tests.

## Verification

- Focused contract/domain batch: 3 files, 18 tests passed.
- TypeScript 7 typecheck: passed.
- Node syntax and diff checks: passed; existing CRLF warnings only in unrelated
  dirty roadmap files.
- Full browser smoke: not rerun; this slice is not imported by App or the
  production bundle yet. Studio integration needs its own browser/export gate.

## Claim ceiling

`stable-json/v0` is not RFC 8785/JCS conformance. No generic release approval,
compatibility score, full MUGEN/IKEMEN parity, or legal claim is made.

## Next highest-leverage move

Add a real Studio producer that binds current project/source revisions, then
surface the same envelopes in Evidence/Build and required ZIP export with
revision-mismatch and stale negatives.
