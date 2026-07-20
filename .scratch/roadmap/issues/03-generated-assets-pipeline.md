# 03 - Generated Assets Pipeline

Status: resolved-at-bounded-scope
Labels: generated-assets, visual-qa, ready-for-agent

## Objective

Make imagegen and sprite-atlas-builder output repeatable, inspectable, and playable without pretending generated/native assets prove imported MUGEN compatibility.

## 2026-07-18 Post-Wayfinder-256 Daily Audit Override

AssetReleasePolicy/v0 and the explicit SPDX subset are closed at bounded scope.
Nova is the single ready record; the remaining records stay diagnostic. Next
prove one independent repository-owned/generated record with fresh permission,
license, source/output digests, ordered transforms, visual QA, collision and
playtest evidence. Keep policy revision identity explicit and public paths
clean. No commercial or third-party asset is authorized. See
`docs/research/2026-07-18-daily-roadmap-architecture-audit-post-wayfinder-256.md`.

## Historical 2026-07-16 Post-Wayfinder-229 Daily Audit Override

Wayfinder 229 closes Nova Boxer permission, safe relative paths, and 13/13
stable digest checks. That is provenance hygiene, not legal approval or release
readiness. Reserve the concurrent AssetReleasePolicy implementation to its
owner; audit its closeout before assigning follow-up. Afterward decide whether
the product supports the normative SPDX expression grammar or an explicitly
enumerated subset, and prove any second release record separately. No
commercial or third-party asset is authorized. See
`docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-229.md`.

## Historical 2026-07-16 Post-Wayfinder-209 Daily Audit Override

No asset-release gate changed. Existing public QA reports still require a
path-hygiene gate, and provenance facts remain distinct from release policy.
Reject/redact absolute and traversal paths, record machine-readable permission
and license for one repository-owned/generated asset, then apply
AssetReleasePolicy/v0 over fresh QA, collision, playtest, transforms, and
digests. Diagnostic export may remain available when release is blocked. No
third-party or commercial asset is authorized. See
`docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-209.md`.

## Historical 2026-07-15 Post-Entry-554 Daily Audit Override

The RedirectID closeouts add no asset-release evidence. AssetProvenance/v2
remains diagnostic. Define AssetReleasePolicy/v0 separately and prove one
repository-owned/generated record with permission/license, input/output
digests, ordered transforms, tool/config identity, required QA, collision,
playtest, and public-path redaction. Unknown or stale evidence blocks release.
Do not claim legal approval or imported-MUGEN credit. See
docs/research/2026-07-15-daily-roadmap-architecture-audit-post-entry-554.md.

## Historical 2026-07-15 Daily Audit Override

AssetProvenance/v2 is closed as a focused diagnostic contract. Next separate
immutable provenance facts from versioned AssetReleasePolicy/v0 and prove one
complete repository-owned/generated record. Unknown, missing, or failing
permission/license, input/output digest, linked transform, required QA,
collision, or playtest evidence must block release; public outputs must redact
local paths. Do not claim RFC 8785, full SPDX grammar, PROV-O, legal approval,
commercial assets, or imported-MUGEN credit without their distinct evidence.
See `docs/research/2026-07-15-daily-roadmap-architecture-audit-entry-549.md`.

## 2026-07-14 Daily Audit Override

Entries 491-492 close `AssetProvenance/v0` and v1 per-file input/output digests for the current source/export session. The old v0 selector is historical.

Next define `AssetProvenance/v2` as a reproducible transform chain: permission/license assertion, input digest, tool/version, config digest, ordered transforms, output hashes, and QA/collision/playtest links. Missing license or digest blocks export readiness; migration from v1 must not invent certainty. Generated/native evidence remains separate from imported-MUGEN compatibility claims.

## Next Useful Cuts

- 2026-07-10 next contract: define `AssetProvenance/v0` with origin, ownership/license, input digest, tool/version, prompt/config digest, ordered transforms, output hashes, QA/playtest links, and public-path redaction. Missing permission or digest must block export readiness; tags and absolute local paths are not provenance.
- Current queue label in `docs/ROADMAP_EXECUTION_BOARD.md`: A1 Generated asset provenance and QA.
- Store prompt/source provenance for each generated character or stage.
- Validate walk cycles by motion, scale, foot placement, baseline, and frame ordering.
- Regenerate bad source sheets instead of fixing bad locomotion by atlas cropping.
- Connect generated assets to Studio evidence and Build readiness.
- Add a single record shape that links prompt, source sheet, atlas manifest, QA report, collisions, runtime manifest entry, and trace/smoke evidence.

## Acceptance

- Origin/permission, source prompt/config, input/tool/transform/output hashes, atlas, manifest, QA report, collisions, and playtest evidence are linked.
- Missing ownership/license assertion or digest blocks export readiness, and public reports/bundles contain no absolute local source path.
- Scale and pose changes are visible in QA artifacts.
- Runtime match still passes visual smoke after asset changes.
- `docs/GENERATED_ASSET_QA_CONTRACT.md` and Studio evidence docs stay synchronized.

## Blocked Claims

- Commercial asset inclusion.
- Treating an unknown license, a tag, or an absolute path as provenance proof.
- Imported MUGEN compatibility credit.
- Procedural repair that hides bad source art without regenerating source sprites.

## 2026-07-16 T28 Closeout

Status: resolved-at-bounded-scope

- Added asset-permission/v0 for repository-owned/generated Nova Boxer with
  verified CC0-1.0 metadata, relative LICENSE.txt reference, two source
  digests, and eleven generated/runtime output digests.
- Studio loads the record, exposes Nova as complete provenance, and exports
  permission metadata, license, source files, and actual bundled hashes.
- Public QA reports for Nova, Mira, and Rook now use relative public paths.
- qa:assets:hygiene scans 62 public text files and verifies 13/13 digests with
  zero violations. qa:smoke passes with zero console/page errors and zero ZIP
  path or digest mismatches.
- This does not define AssetReleasePolicy/v0, legal approval, imported-MUGEN
  credit, commercial authorization, or full runtime parity.

Next: define AssetReleasePolicy/v0 separately and keep unknown or stale
permission, license, QA, collision, playtest, transform, and digest evidence
fail-closed.

## 2026-07-16 T28 SPDX boundary closeout

Status: resolved-at-explicit-subset-scope

- Added `mugen-web-sandbox/spdx-expression-subset/v0` as the shared parser
  contract for permission and provenance license expressions.
- Supported syntax is one identifier or `AND`/`OR` chains. Parentheses, `+`,
  `WITH`, `LicenseRef`, `DocumentRef`, and line breaks are rejected until a
  pinned authority/profile expands the contract.
- Profile is machine-readable in Nova metadata, visible in policy evidence,
  and asserted in ZIP smoke. This is syntax validation, not SPDX License List
  matching or legal approval.
- Focused 16/16, TypeScript 7, asset hygiene, and full browser smoke pass;
  smoke profile artifact records 1 ready and 9 diagnostic-only assets.

## 2026-07-16 T29 Closeout

Status: resolved-at-bounded-scope

- Added `mugen-web-sandbox/asset-release-policy/v0` as a decision layer above
  provenance. Required permission, license, digest, ordered transform, QA,
  collision, and playtest evidence now carry status and freshness.
- Missing, failing, unknown, stale, or non-fresh required evidence blocks
  release. Diagnostic ZIP export remains available for blocked records.
- Nova Boxer is the only fresh ZIP-ready record: `ready`, `canRelease: true`,
  1 ready record and 9 diagnostic-only records. Its motion warning remains
  visible because atlas/motion QA also has a passing record.
- Focused policy tests pass 13/13; TypeScript 7 typecheck passes; final browser
  smoke passes in 398.9s with 0 page errors and 0 console issues.

This remains repository-owned/generated evidence. It does not grant legal or
commercial authorization, imported-MUGEN credit, IKEMEN execution, or parity.
Next: revision-bind policy inputs before a shared EvidenceContract consumer.
