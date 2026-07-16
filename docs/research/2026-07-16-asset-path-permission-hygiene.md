# Asset path and permission hygiene

Date: 2026-07-16

## Question

What minimum repository-owned/generated asset evidence is needed before public
Studio bundles can expose permission facts without leaking local paths or
pretending that AssetProvenance/v2 is a release approval?

## Answer

Keep immutable provenance facts separate from a future release policy. For one
first-party fixture, require a versioned metadata record with ownership,
permission, verified SPDX expression, relative license reference, and stable
SHA-256 plus byte length for source and generated files. Reject absolute,
drive-relative, file-URI, and traversal paths at parser and public-report
boundaries. Let imported assets remain unknown or blocked until their own
permission evidence exists.

## Sources

- Repository issue 03 - Generated Assets Pipeline: acceptance separates public
  path redaction, permission/license evidence, and the future release policy.
- src/app/StudioAssetProvenance.ts: existing v2 diagnostic transform-chain,
  license normalization, and local-path redaction contract.
- public/characters/nova-boxer: repository-owned generated fixture and runtime
  output set.
- SPDX License Expressions specification:
  https://spdx.github.io/spdx-spec/v3.0.1/annexes/spdx-license-expressions/

## Findings

1. Nine tracked public reports contained local Windows paths in run_dir or
   source fields across Nova, Mira, and Rook. Relative public route references
   remove the leak without changing runtime asset identity.
2. AssetProvenance/v2 already blocks unknown or unverified licenses, but it had
   no machine-readable ownership/permission artifact for a generated public
   asset. A separate asset-permission/v0 record keeps that fact explicit.
3. Studio can prove a first-party output before export from its stable metadata,
   then replace the expected output set with actual bundled records during ZIP
   export. Missing or failed bundle records therefore cannot be hidden by the
   metadata.
4. A standalone Node gate is needed because browser provenance alone cannot
   inspect every raw public QA report. The gate scans public text files,
   parses permission metadata, and recomputes each declared digest.

## Implementation

- Added StudioAssetPermission parser and first-party metadata route.
- Added Nova LICENSE.txt and asset-permission.json.
- Integrated metadata loading, provenance license/input/output evidence, and ZIP
  copying for metadata, license, and source files.
- Hardened provenance redaction for traversal and drive-relative inputs.
- Added qa:assets:hygiene and expanded qa_smoke ZIP/path/digest assertions.

## Verification

- qa_asset_path_hygiene: passed, 62 files, 13/13 digests, 0 violations.
- Focused Vitest: 2 files, 10/10 tests.
- TypeScript 7 typecheck: passed.
- qa_smoke: passed, 312.5s, 0 console issues, 0 page errors.

## Uncertainty

The CC0 declaration is a repository assertion for this fixture, not legal
advice or external license approval. No imported MUGEN or commercial asset was
promoted. AssetReleasePolicy/v0 still must define freshness and required QA,
collision, playtest, transform, and release semantics.
