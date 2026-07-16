# Prove productive multi-kind PackageAnalysis/v1 export

Date: 2026-07-16
Status: resolved at bounded scope
Depends on: Wayfinder 227
Implementation commits: `9bce8fde`, `eee286a1`

## Objective

Raise PackageAnalysis from an identity-backed scanner record to a productive
export contract. The acceptance surface is the real imported KFM package,
with explicit evidence that character, stage, system, and screenpack findings
survive the Studio Build/Evidence path and the exported ZIP.

## Implemented contract

- Build renders `entrypointCount` and non-zero finding coverage by category.
- The QA bridge captures the v1 summary, Evidence record, and Trust Chain row.
- ZIP inspection requires v1, nested v0, source SHA-256, semantic digest,
  finding coverage, and entrypoint coverage.
- The KFM source package proves all four categories in one VFS-backed report:
  `character`, `stage`, `system`, and `screenpack`.
- Workbench project reopen now uses a DOM event dispatch path in the smoke
  harness when a stored row is attached inside a collapsed `0x0` surface;
  failed opens retain structured bridge/selector diagnostics.

## Browser/export evidence

Observed from `.scratch/qa/qa-smoke/diagnostics.json`:

- `pnpm run qa:smoke`: passed in 280.6s;
- console issues: `0`; page errors: `0`;
- KFM v1: 14/14 recognized files, 4 entrypoints, 47 findings;
- category coverage: character `39`, stage `5`, system `1`, screenpack `2`;
- source package SHA-256: `4b5ff597d4a17328d718d43281a4ab8634f9fc10519fe70ba58bc63170f3527d`;
- semantic digest: `c5497ed8`; envelope checksum: `caace7d0`;
- exported package: 68 files, 53 bundled binary assets, no missing bundled
  files, no absolute path leaks;
- required ZIP payload: `studio/package-analysis.json`, with a required
  `package-manifest.json` entry and v1 metadata.

The same report remains visible as scanner-only Evidence and as a current
`package-analysis` Trust Chain target. The IKEMEN profile remains a warning;
recognized scanner findings are not promoted to runtime execution.

## Verification

- `node --check scripts/qa_smoke.cjs`: passed.
- `git diff --check`: passed for the feature patch; unrelated roadmap docs
  retain their existing line-ending warnings.
- Full browser smoke: passed after the harness fix.

## Audit and claim ceiling

This closes the bounded productive consumer for multi-kind static package
analysis. It does not execute IKEMEN Go, ZSS, Lua, screenpack behavior, or
unsupported MUGEN controllers; it does not prove renderer/gameplay parity,
license compatibility, or full external-engine equivalence. Asset provenance
still blocks release readiness for the current generated/imported bundle.

Next: define the next independent release contract, likely an explicit asset
release policy or a runtime-backed compatibility slice.
