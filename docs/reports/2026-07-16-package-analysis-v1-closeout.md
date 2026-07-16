# PackageAnalysis/v1 closeout

Date: 2026-07-16
Wayfinder ticket: 227
Implementation commits: `4cbb1763`, `152097f3`

## Global status

| Area | Status | Evidence |
| --- | --- | --- |
| v1 source/package identity | passed | package + per-file SHA-256 envelope |
| Semantic observation stability | passed | semantic digest stable, envelope changes with `observedAt` |
| Analyzer/ruleset/upstream pin | passed | exact identity and version-drift negatives |
| Nested v0 validation | passed | tampered nested report rejected |
| Targetable locations | passed | nested findings retain virtual path and line |
| Studio Bridge/Build/Evidence/Trust | passed | v1 canonical report, semantic/source targets |
| Required ZIP export | passed | v1 `studio/package-analysis.json` and required manifest entry |
| TypeScript 7 and production build | passed | `pnpm typecheck`, `pnpm run build` |
| Broad browser smoke | passed | `pnpm run qa:smoke`, 0 console/page errors |

## Result

Package analysis now has two explicit identity layers: SHA-256 source identity
for the imported VFS and deterministic semantic/envelope markers for report
comparison and transport integrity. The KFM browser path exported v1 with
source `4b5ff597...`, semantic `c5497ed8`, envelope `40e13280`, 47 findings,
and `partial` status. The IKEMEN fixture exported a separate v1 semantic
record with 28 findings and retained `scanner-only` warning semantics.

## QA adjudication

The first broad run hit a pre-existing asset-filter synchronization race in
`captureStudioAssetReplacement`; no product failure was observed. The harness
now retries through a fresh generated-filter node before failing. The next
full smoke passed all runtime, Studio, export, desktop/mobile, and IKEMEN
assertions. Existing Vite chunk-size warning remains unchanged.

## Claim ceiling and next

v1 proves reproducible static analysis identity and export integrity. It does
not execute IKEMEN, ZSS, Lua, or screenpack behavior, and it does not grant
rendering, gameplay, legal, or full MUGEN/IKEMEN parity. Next: add explicit
export assertions for productive character, stage, system, and screenpack
analysis routes before moving to AssetReleasePolicy or another runtime slice.

Artifacts:

- `.scratch/qa/qa-smoke/diagnostics.json`
- `.scratch/qa/qa-smoke/project-package.zip`
- [PackageAnalysis/v1 contract](../../src/mugen/compatibility/PackageAnalysis.ts)
- [Studio integration](../../src/app/App.ts)
