# Prove generated asset path and permission hygiene

Type: task
Status: resolved
Blocked by: Wayfinder 228
Date: 2026-07-16

## Question

Can one repository-owned/generated asset expose machine-readable permission and
license facts with stable input/output digests while public reports and the
Studio export reject local absolute or traversal paths?

## Answer

Yes, at bounded diagnostic scope. Nova Boxer now publishes
asset-permission/v0 with repository ownership, repository permission, verified
CC0-1.0 metadata, two source PNG digests, and eleven generated/runtime output
digests. LICENSE.txt is bundled with the metadata and source files.

Studio loads and validates the metadata before export. The generated Nova
provenance record is complete in the Assets surface and remains complete after
the ZIP export joins actual bundled records. Imported MUGEN records remain
blocked or unknown when no permission/license assertion exists.

The path redactor now rejects traversal segments, drive-relative paths, local
absolute paths, file URIs, and unapproved root paths before allowing the small
public route allowlist. Existing public reports for Nova, Mira, and Rook no
longer contain local Windows paths.

## Evidence

- qa_asset_path_hygiene scans 62 public text files: 0 violations.
- The same gate verifies 13 Nova source/output digest records: 13/13 pass.
- qa_smoke passes in 312.5s with 0 console issues and 0 page errors.
- Exported ZIP: Nova is the ready asset and declared-license asset; path
  violations, provenance digest mismatches, package path violations, and
  permission digest mismatches are all zero.
- Studio Assets sees Nova as complete before package export.
- Focal tests: StudioAssetProvenance and StudioAssetPermission, 10/10.
- TypeScript 7 typecheck, node syntax checks, and git diff check pass.

## Claim ceiling

This is repository-owned fixture evidence and diagnostic provenance. It is not
legal approval, a third-party/commercial asset authorization, imported MUGEN
credit, AssetReleasePolicy/v0, or IKEMEN execution/parity evidence.

## Next

Define AssetReleasePolicy/v0 as a separate fail-closed policy over fresh
permission, license, transform, QA, collision, playtest, and digest evidence.
