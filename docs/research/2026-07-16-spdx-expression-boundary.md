# SPDX expression support boundary

Date: 2026-07-16

## Question

What can the generated-asset permission and release paths honestly validate
without shipping a current SPDX License List and exception corpus?

## Answer

Declare a versioned syntactic subset and make it fail closed. The current
profile accepts a single identifier or `AND`/`OR` chains of identifiers. It
does not accept parentheses, `+`, `WITH`, `LicenseRef-*`, `DocumentRef-*`, or
line breaks. The profile is visible in metadata and release evidence. This
keeps `CC0-1.0` usable while making the unsupported surface explicit.

## Sources

- SPDX Specification 3.0.1, *SPDX license expressions* (normative Annex B):
  https://spdx.github.io/spdx-spec/v3.0.1/annexes/spdx-license-expressions/
- SPDX Specification 3.0.1, *LicenseExpression*:
  https://spdx.github.io/spdx-spec/v3.0.1/model/SimpleLicensing/Classes/LicenseExpression/
- `src/app/StudioAssetPermission.ts`: existing permission metadata parser.
- `src/app/StudioAssetProvenance.ts`: provenance license status and export
  readiness behavior.
- `src/app/StudioAssetReleasePolicy.ts`: release policy blocker semantics.

## Findings

1. The normative SPDX grammar includes License List identifiers, user-defined
   `LicenseRef` values, `WITH` exceptions, `+` current-or-later suffixes,
   parentheses, and `AND`/`OR` composition. The previous project regex did
   not model those distinctions and therefore could not claim full grammar
   support.
2. Syntactic acceptance is not license-list matching. Even a grammar-compliant
   identifier requires authoritative list/version evidence before a project
   can claim identity or legal approval.
3. A bounded subset is safer for the current repository because only the
   repository-owned `CC0-1.0` fixture is being released. Unsupported forms
   should block release, not be silently normalized.
4. A shared validator avoids drift between permission metadata and
   AssetProvenance/v2. The profile string makes future migration explicit.

## Decision

Implement `mugen-web-sandbox/spdx-expression-subset/v0` with these exact
forms:

| Form | Example | State |
| --- | --- | --- |
| single identifier | `CC0-1.0` | supported |
| AND chain | `CC0-1.0 AND MIT` | supported syntax |
| OR chain | `CC0-1.0 OR BSD-3-Clause` | supported syntax |
| `+` suffix | `GPL-2.0+` | blocked until profile expands |
| exception | `MIT WITH Classpath-exception-2.0` | blocked until source is pinned |
| parentheses | `(MIT OR BSD-3-Clause)` | blocked until profile expands |
| user reference | `LicenseRef-local` | blocked until authority is pinned |

The profile describes syntax only. It does not assert that an arbitrary token
is an SPDX License List identifier.

## Uncertainty and next decision

If a second asset needs exceptions, `+`, or user references, pin a dated SPDX
License List/exception source and create a new profile version. Do not widen
the regex opportunistically. Revision-bound shared evidence remains the next
cross-domain contract.
