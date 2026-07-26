# ADR 0054: Source Authority Epoch / Manifest v1

## Status

Accepted for bounded control evidence. 2026-07-26.

## Context

SourceAuthorityManifest/v0 compares one normative pin to a local cache and keeps
semantic review unclassified. T389-T406 work also cites working pin `4aa0ba38`
while v0 normative remains `05b7d98a`. A single global pin promotion would mix
reviewed and unreviewed families. DA26-02 showed juggle-bearing lines are equal
between those pins, but wiki text still differs on non-A reset.

## Decision

Introduce **SourceAuthorityEpoch/v1** and **SourceAuthorityManifest/v1**:

- Two pins: normative `05b7d98a`, working `4aa0ba38`.
- Families each carry status `same | changed-reviewed | changed-blocked | unreviewed`.
- Per-file digests may be present for either pin; missing digests are recorded
  as missing-normative / missing-working / unknown.
- Stable SHA-256 digest; parse rejects tamper.
- Manifest v1 wraps an epoch and may point at the legacy v0 artifact without
  inheriting v0 claim ceilings.
- PackageAnalysis/v1 upstream revision continues to name the normative pin only;
  family provenance lives in the epoch.

Juggle is recorded as `same` under pin-era equality evidence with an explicit
wiki conflict note. Other families start `unreviewed`.

## Consequences

Control can cite per-family provenance without promoting either pin globally.
Scores and runtime parity do not move. Missing dual-pin git objects are honest:
materializer may pair equal local digests for a curated `same` family or leave
missing-normative for unreviewed families.

## Evidence

- `src/mugen/compatibility/SourceAuthorityEpoch.ts`
- `src/tests/SourceAuthorityEpoch.test.ts`
- `scripts/materialize_source_authority_epoch.cjs`
- `docs/evidence/source-authority-epoch-v1.json`
