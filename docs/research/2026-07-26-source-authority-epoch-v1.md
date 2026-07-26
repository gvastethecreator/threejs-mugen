# SourceAuthorityEpoch / Manifest v1 (DA26-10)

Date: 2026-07-26
Type: control evidence
Status: closed
ADR: `docs/adr/0054-source-authority-epoch-v1.md`

## Question

Can the repo record two Ikemen pins and per-family semantic status (same /
changed-reviewed / changed-blocked / unreviewed) with missing-file tracking and
digest tamper detection, without promoting either pin globally?

## Answer

Yes. SourceAuthorityEpoch/v1 plus SourceAuthorityManifest/v1 wrap that contract.

## Pins

| Role | Revision |
| --- | --- |
| normative | `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703` |
| working | `4aa0ba38f851c52549ba182310e9e53361cd472a` |

## Families (initial)

| Family | Status | Notes |
| --- | --- | --- |
| juggle | same | DA26-02 pin-era line equality; wiki non-A wording is not pin authority |
| hitdef-core | unreviewed | no epoch promotion |
| projectile | unreviewed | remains claim-blocked for parity |

## Evidence

- Implementation: `src/mugen/compatibility/SourceAuthorityEpoch.ts`
- Tests: create, reverse-order stability, missing digests, same/changed
  consistency, epoch tamper, manifest v1 tamper, committed artifact parse
- Materializer: `pnpm materialize:source-authority-epoch`
- Artifact: `docs/evidence/source-authority-epoch-v1.json`
- PackageAnalysis/v1 upstream still points at the normative pin constant from
  the epoch module

## Claim allowed

Per-family provenance between the two named pins for recorded families.

## Claim blocked

Global pin promotion, score movement, runtime parity from epoch alone, wiki as
replacement for pin rules.
