# Implement PackageAnalysis/v1 identity and freshness

Date: 2026-07-16
Status: resolved at bounded scope
Depends on: Wayfinder T03, T22, and ticket 226
Implementation commits: `4cbb1763`, `152097f3`

## Outcome

`PackageAnalysis/v1` now wraps the existing scanner report in a stable source
identity envelope. The source-import path uses the already verified VFS
fingerprint, so the report carries real package and per-file SHA-256 values
without hashing the same source a second time.

## Contract

The v1 envelope contains:

- source name, package SHA-256, byte length, file count, and sorted per-file
  SHA-256 records;
- nested parser-validated `PackageAnalysis/v0` findings, summaries, claims,
  and path/line locations;
- analyzer identity `mugen-web-sandbox/package-analysis@1.0.0`;
- ruleset identity `mugen-web-sandbox/package-analysis-rules@1.0.0`;
- pinned IKEMEN upstream identity
  `ikemen-engine/Ikemen-GO@05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`;
- `observedAt`, semantic digest, and envelope checksum.

The semantic digest excludes observation time, source display name, and the
nested transport checksum. It remains a deterministic FNV-1a32 identity over
the source file digests and normalized analysis. The envelope checksum covers
the full transport record, including observation time. This distinction keeps
semantic freshness comparable while preserving an auditable observation.

## Fail-closed validation

The parser rejects invalid timestamps, source digest/path/byte metadata,
duplicate or unsorted source files, analyzer/ruleset/upstream drift, nested v0
tampering, source-to-analysis file mismatch, semantic digest drift, and
envelope checksum drift. Nested findings remain targetable by virtual path and
line; no runtime execution claim is inferred from a recognized scanner item.

## Integration

- App materializes v1 on accepted ZIP and folder imports.
- v0 remains available as the nested compatibility projection for existing
  scanner UI and finding rendering.
- Bridge exposes both projections, with v1 as the canonical exported record.
- Build, Evidence, and Trust Chain identify the v1 envelope and semantic/source
  digests.
- `studio/package-analysis.json` now contains v1 and remains required in the
  exported project manifest.

## Evidence

- `src/tests/PackageAnalysis.test.ts`: 9/9 tests passed, including
  deterministic observation-time behavior, nested invalidation, version drift,
  source mismatch, role classification, and IKEMEN findings.
- Combined focal contracts with SourceWriteReceipt: 15/15 passed.
- `pnpm typecheck`: passed under TypeScript 7.
- `pnpm run build`: passed; existing large-chunk advisory unchanged.
- `pnpm run qa:smoke`: passed after a bounded asset-filter retry in the QA
  harness; runtime, Studio, folder/ZIP, desktop/mobile, ZIP inspection, and
  IKEMEN scan passed with 0 console issues and 0 page errors.

Observed KFM export:

- source SHA-256: `4b5ff597d4a17328d718d43281a4ab8634f9fc10519fe70ba58bc63170f3527d`;
- semantic digest: `c5497ed8`;
- envelope checksum: `40e13280`;
- 14/14 files recognized, 47 findings, 2 IKEMEN scanner findings, status
  `partial`.

## Claim ceiling

This closes PackageAnalysis/v1 identity and freshness materialization. It does
not execute IKEMEN Go, ZSS, Lua, screenpack behavior, or unsupported MUGEN
features; it does not prove rendering/gameplay parity, licensing, or external
engine equivalence. Next: strengthen the productive multi-kind package
consumer with explicit stage/system/screenpack export assertions.
