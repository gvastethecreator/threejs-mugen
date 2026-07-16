# Implement Studio PackageAnalysis/v0

Date: 2026-07-16
Status: resolved at bounded scope
Depends on: Wayfinder 225
Implementation commit: `6d6bb985`

## Outcome

Studio now materializes a parser-validated `PackageAnalysis/v0` report for an
imported MUGEN or IKEMEN source bundle. The report is derived from the same
VirtualFileSystem used by the runtime import path, so folder and ZIP sources
share one classification, reference-resolution, and integrity contract.

## Contract

`PackageAnalysis/v0` records:

- package files, byte lengths, and bounded roles for characters, stages,
  system files, screenpacks, and assets;
- source-located definition findings, dependency resolution, MUGEN version
  profile, parser diagnostics, and select roster resolution;
- IKEMEN feature findings under the explicit `ikemen-go-scan` profile;
- deterministic status, summary counters, allowed/blocked claims, and an
  integrity checksum.

The parser rejects unsupported schemas, checksum drift, status drift, finding
count drift, and unsorted findings. `recognized`, `partial`, and `unknown`
remain separate so a scanner result cannot silently become an execution claim.

## Studio integration

- Build and Evidence expose a `Package Analysis` panel and `analysis` filter.
- Evidence records scanner-only severity, source locations, checksum, and the
  explicit impact that IKEMEN findings are not executed by the browser runtime.
- Build Readiness and Trust Chain target `package-analysis:<checksum>` and
  report freshness against the current imported report.
- The browser bridge exposes a structured clone for QA and diagnostics.
- Exported project ZIPs include `studio/package-analysis.json` as a required
  manifest file whenever an imported package has a report.
- Source-import rollback preserves the report with the accepted transaction.

## Evidence

- `src/tests/PackageAnalysis.test.ts`: 4/4 focused contract tests passed.
- Combined focal contracts with SourceWriteReceipt: 10/10 passed.
- `pnpm typecheck`: passed under TypeScript 7.
- `pnpm run build`: passed; the existing large-chunk advisory remains.
- `pnpm run qa:smoke`: passed across runtime, Studio, folder/ZIP import,
  desktop/mobile surfaces, package export, and IKEMEN scan; diagnostics record
  0 captured console/page errors.

Observed package-analysis evidence:

- official KFM package: 14/14 files recognized, 47 findings, 2 IKEMEN
  scanner findings, status `partial`, checksum `a2615d08`;
- IKEMEN scan fixture: 28 findings, `ikemen-go-scan` detected, Evidence
  `warn`, Trust Chain target kind `package`;
- exported ZIP: required `studio/package-analysis.json`, schema
  `mugen-web-sandbox/package-analysis/v0`, checksum, and finding summary.

Artifacts:

- `.scratch/qa/qa-smoke/diagnostics.json`
- `.scratch/qa/qa-smoke/project-package.zip`

## Audit and claim ceiling

This closes scanner evidence materialization for the current imported source
path. It does not execute ZSS, Lua, IKEMEN screenpack behavior, or external
engine code; it does not prove rendering, gameplay, license, or full
MUGEN/IKEMEN parity. Findings remain report-only until a separate runtime
capability is implemented and independently evidenced.

Next: select the next independent release contract, prioritizing asset
provenance/export integrity or the first runtime-backed IKEMEN capability.
