# Research: Studio GateEvidence/v0

Date: 2026-07-16
Lane: R2 Studio editor reliability and evidence
Wayfinder ticket: 224
Implementation commit: `c8145f54`

## Question

How can Studio replace a hardcoded architecture green with evidence that can
be inspected, aged, exported, and rejected when its payload is tampered with?

## Decision

Keep `GateEvidenceResult/v0` app-owned for the first implementation. The
contract is consumed by Build, Evidence, and Trust Chain, which gives it more
than one real application consumer without prematurely moving it into shared
runtime core. Promote it to a shared contract only after another independent
producer or consumer requires the same shape.

Separate diagnostic and release intent. A useful diagnostic record may be
shown in Studio, but only a passed, current, release-intent record can make
the corresponding gate exportable. This prevents one `canExport` boolean from
silently conflating debugging usefulness with distribution readiness.

## Findings

- The executable producer is repository-owned and deterministic at the
  payload level: `pnpm run check:boundaries` is recorded with
  `check_boundaries.cjs` and `repository-script/v1`.
- Freshness is evaluated from `observedAt` and `freshness.maxAgeMs`; a stale
  result remains visible but blocks release export.
- The digest is a stable FNV-1a 32-bit transport-integrity marker. It detects
  accidental or unsupported payload edits inside the application boundary; it
  is not a cryptographic artifact identity or an external attestation.
- The ZIP manifest makes `studio/gate-evidence.json` required, so a package
  cannot silently omit the evidence document while retaining the UI state.
- The current materialized record was generated at source revision
  `d69d12a4058c5654b99787a23499a60925b9d85c`, observed at
  `2026-07-16T18:44:14.146Z`, with digest `fnv1a32:c4be5cf8`.

## Verification policy

Contract tests cover deterministic hashing, parser acceptance, tamper
rejection, freshness, intent gating, missing observations, and duplicate
identity. Browser QA verifies the end-to-end path from Build and Evidence to
the exported ZIP at desktop and mobile sizes. The broad smoke now passes after
its two-page stored-project selection received the same attached-row and
bridge-state synchronization as the focused Workbench journey.

## Boundaries

Only the architecture-boundary producer is real in this slice. Existing
asset, source, trace, compatibility, and runtime rows retain their current
contracts. Full Studio gate production, source-write receipts, external
Ikemen-Go execution, and complete MUGEN/IKEMEN parity remain open.
