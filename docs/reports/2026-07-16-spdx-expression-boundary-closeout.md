# SPDX expression boundary closeout

Date: 2026-07-16
Scope: T28 / Wayfinder 231

## Task state

Completed at explicit subset scope.

## Artifact verdict

Win against the support-boundary acceptance target. Permission metadata,
provenance, release evidence, and ZIP assertions now share one named syntax
profile. Unsupported normative SPDX forms fail closed instead of being
mistaken for full support.

## Changes

- Added `StudioLicenseExpression` with
  `mugen-web-sandbox/spdx-expression-subset/v0`.
- Accepted only identifier, `AND`, and `OR` forms; rejected `+`, `WITH`,
  parentheses, `LicenseRef`, `DocumentRef`, and line breaks.
- Required the profile in first-party permission metadata and surfaced it in
  release-policy license evidence.
- Reused the validator in AssetProvenance/v2 to prevent parser drift.
- Added focused positive/negative tests and package profile assertions.

## Verification

- Focused batch: 4 files, 16 tests passed.
- TypeScript 7 typecheck: passed.
- `qa:assets:hygiene`: passed, 62 files, 13/13 digests, 0 violations.
- Node syntax and diff checks: passed.
- Final T29 browser smoke remains the integration baseline; T28 profile
  changes require the next full smoke before release of this commit.

## Claim ceiling

No normative SPDX conformance, current License List match, exception
resolution, legal approval, commercial authorization, imported MUGEN credit,
IKEMEN execution, parity, or score movement.

## Next highest-leverage move

Run full browser/package smoke with the profile in the exported metadata, then
bind revision/freshness facts into the next shared evidence contract.
