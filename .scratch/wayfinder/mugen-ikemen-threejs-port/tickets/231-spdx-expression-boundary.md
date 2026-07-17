# Define the SPDX expression support boundary

Type: task
Status: resolved
Blocked by: Wayfinder 230
Date: 2026-07-16

## Question

Does the asset permission/release path implement normative SPDX license
expressions, or does it expose a narrower parser contract that cannot be
mistaken for full SPDX support?

## Answer

The project now declares and enforces
`mugen-web-sandbox/spdx-expression-subset/v0`. Supported forms are one
identifier or whitespace-separated `AND`/`OR` chains. The subset rejects
parentheses, `+`, `WITH`, `LicenseRef-*`, `DocumentRef-*`, line breaks, and
other forms that the normative grammar supports. Reports expose the profile
alongside the expression.

This is deliberate. No full SPDX License List or exception corpus is bundled,
so the implementation does not claim normative SPDX grammar or legal license
matching. Unsupported expressions fail closed and block the release policy.

## Evidence

- `src/app/StudioLicenseExpression.ts`: versioned profile and validator.
- `src/tests/StudioLicenseExpression.test.ts`: accepted/rejected syntax matrix.
- `StudioAssetPermission` requires the profile; provenance uses the same
  validator; Studio policy evidence displays the profile.
- Public Nova metadata and ZIP smoke assertions carry the profile.
- Focused tests, TypeScript 7 typecheck, asset hygiene, and final smoke cover
  parser, metadata, export, and runtime-facing consumers.

## Claim ceiling

No full SPDX conformance, license-list identity validation, legal advice,
commercial authorization, imported MUGEN credit, or parity claim.

## Next

Add a pinned SPDX License List/exception source only if a future asset needs a
form outside this subset; otherwise keep the subset as the explicit policy
boundary and proceed to revision-bound shared evidence.
