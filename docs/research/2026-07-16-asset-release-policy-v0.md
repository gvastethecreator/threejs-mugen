# AssetReleasePolicy/v0

Date: 2026-07-16

## Question

What independent release decision must sit above AssetProvenance/v2 so one
generated asset can be released only from fresh, inspectable evidence while
incomplete records remain exportable for diagnosis?

## Answer

Use a versioned policy record, not a new provenance status. The policy requires
permission, verified license, input/output digest coverage, ordered transforms
with tool/version/config identity, atlas and motion QA, collision data, and a
matching playtest trace. Each required evidence item carries a status and
freshness. `fail`, `unknown`, `stale`, or non-fresh evidence blocks release.
Warnings remain visible and are non-blocking only when the same required kind
also has a pass.

## Sources

- `src/app/StudioAssetProvenance.ts`: repository provenance/v2 contract and
  its separation of license, permission, transforms, hashes, and QA links.
- `src/app/StudioAssetPermission.ts`: repository-owned permission metadata,
  verified SPDX expression, safe relative paths, and source/output digests.
- `docs/GENERATED_ASSET_QA_CONTRACT.md`: atlas, motion, collision, and
  playtest evidence expectations.
- `docs/research/2026-07-16-asset-path-permission-hygiene.md`: prior decision
  that metadata/provenance is not release approval.
- SPDX, *Handling License Information*:
  https://spdx.dev/learn/handling-license-info/

## Findings

1. AssetProvenance/v2 answers where an asset came from and whether its
   transform chain is complete. It should not silently become a release
   approval when public bundle bytes or runtime evidence change.
2. Permission and license declarations must be checked against the actual
   ZIP records. Declared metadata alone is insufficient after export.
3. Freshness is evidence-specific. For files, it means actual package bytes
   match declared byte length and SHA-256. For playtest, it means a parseable
   `generatedAt` and a trace target matching the asset. Missing freshness is
   unknown, not pass.
4. QA warnings are useful evidence. Nova's body-center warning remains in the
   policy record, while atlas/motion evidence still supplies a passing QA
   check. Hiding the warning would weaken auditability.
5. Diagnostic export and release eligibility are separate paths. Blocked
   imported or incomplete records can stay in the package for inspection, but
   only named records with a ready policy may be called releasable.

## Implemented rule table

| Required kind | Minimum proof | Block condition |
| --- | --- | --- |
| permission | valid metadata and actual permission file | missing, unknown, failed digest |
| license | verified SPDX-like expression and actual license file | missing, unverified, stale |
| digest | all declared source/output files match package bytes | missing or mismatch |
| transform | ordered transform chain with tool/version/config | absent or incomplete |
| QA | atlas manifest/report plus motion report | missing, failed, or stale |
| collision | bundled AIR plus at least one Clsn1/Clsn2 frame | missing or stale |
| playtest | current matching trace with timestamp | missing, failed, or mismatched |

## Uncertainty

The parser intentionally accepts the repository's bounded SPDX-like
expression subset; it does not claim full SPDX grammar coverage. The policy
does not grant legal authorization or prove imported MUGEN compatibility. A
future EvidenceContract must decide how source revision, policy digest, and
artifact freshness are shared across Studio surfaces.

## Decision impact

T29 can close one generated record without promoting imported assets or moving
the compatibility score. The next contract should consume the policy record as
an evidence input and preserve its blocked/diagnostic distinction.
