# Implement ProjectReleaseDecision/v0

Type: task
Status: resolved
Blocked by: None

Implementation commit: `2da0ece2`

## Question

Can Studio decide diagnostic exportability separately from release readiness
without treating a playable or partially analyzed project as publishable?

## Answer

Implement `ProjectReleaseDecision/v0` as a parser-validated decision document
with two explicit intents: `diagnostic` and `release`. Project storage state,
runtime manifest/trace, GateEvidence, EvidenceEnvelope freshness and project
revision, asset release policy, source package linkage, promoted compatibility
snapshot, optional PackageAnalysis, and optional SourceWriteReceipt are
normalized into evidence facts. Missing, stale, unknown, failed, blocked, and
wrong-revision facts produce deterministic blockers and a next action. A
diagnostic package remains exportable while release stays blocked.

## Evidence target

- Build and Evidence expose the same schema, semantic digest, intent split, and
  explicit blocker summary through the bridge.
- Trust Chain adds a `project-release-decision` contract target and preserves
  the decision as a build/evidence row.
- Required ZIP export includes `studio/project-release-decision.json` and a
  manifest summary whose semantic digest matches the exported document.
- Project storage conflict, reload, stale-save rejection, and local-copy
  browser paths remain green after the integration.

## Closeout evidence

- `pnpm exec vitest run src/tests/ProjectReleaseDecision.test.ts`
  passes `4/4`; the grouped envelope/policy/decision focal run passes `9/9`.
- `pnpm run typecheck`, `pnpm run build`, `node --check scripts/qa_smoke.cjs`,
  and scoped `git diff --check` pass.
- `pnpm run qa:smoke` passes in started-Vite mode in `426s`; the browser
  artifact reports `0` page errors and `0` console issues.
- `.scratch/qa/qa-smoke/diagnostics.json` records
  `project-release-decision/v0` in Build and Evidence, diagnostic exportable
  `true`, releaseable `false`, one explicit blocker, 12 Trust Chain rows, and
  matching semantic digest `fnv1a32:a977b0e6` in Build, Evidence, ZIP, and
  package manifest.
- The current fixture's one blocker is an unknown asset-policy fact; this is
  intentionally diagnostic-only and is not a legal approval or publishing
  claim.

## Claim ceiling

The contract proves a deterministic local decision over the evidence available
to this Studio session and separates diagnostic packaging from release intent.
It does not prove legal approval, public publishing, crash durability,
external-engine parity, rollback/netplay, or full MUGEN/IKEMEN parity.

Next ordered Studio cut: `T09` deterministic semantic export with persisted
reanalysis still separate from public release.
