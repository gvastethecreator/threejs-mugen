# Define EvidenceEnvelope/v0 shared facts

Type: task
Status: resolved
Blocked by: Wayfinder 231
Date: 2026-07-16

## Question

What smallest shared evidence envelope can carry revision, provenance,
derivation, observation, canonical bytes, and a cryptographic digest across
GateEvidence and PackageAnalysis without importing release policy into the
shared core?

## Answer

Use a facts-only `EvidenceEnvelope/v0` with explicit subject, entity/activity/
agent provenance, source/project/producer revisions, derivation source IDs,
one observation status/freshness record, semantic and artifact digests, and a
SHA-256 digest over deterministic `stable-json/v0` canonical bytes. Adapters
must supply a producer revision and artifact digest; the envelope must not
contain `canRelease` or a domain release decision.

## Evidence

- GateEvidence adapter.
- PackageAnalysis/v1 adapter.
- Canonical/deterministic serialization test.
- Tamper and deletion parser negatives.
- SHA-256 known-vector test; focused GateEvidence/PackageAnalysis batch passes
  18/18.
- TypeScript 7 typecheck, Node syntax, and diff checks pass.

## Claim ceiling

This is a shared facts contract only. It does not aggregate release decisions,
replace AssetReleasePolicy, move compatibility scores, or claim MUGEN/IKEMEN
parity.

## Next

Integrate envelopes into Studio Evidence/Build and required export only after a
real project/source revision producer is available; do not infer revisions from
timestamps.
- Claim ceiling: shared facts only; no aggregate release or compatibility
  parity claim.
