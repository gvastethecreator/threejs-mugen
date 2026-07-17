# Studio ProjectReleaseDecision/v0 closeout

Date: 2026-07-17
Wayfinder ticket: 235
Implementation commit: `2da0ece2`

## Global status

| Area | Status | Evidence |
| --- | --- | --- |
| Decision contract | passed | Parser-validated `project-release-decision/v0` with diagnostic/release intents |
| Blocker matrix | passed | Missing, stale, unknown, failed, blocked, and wrong-revision paths are explicit |
| Studio integration | passed | Evidence, Build Readiness, Trust Chain, bridge, and ZIP consume the decision |
| Diagnostic/release separation | passed | Current fixture exports diagnostics while release remains blocked by one asset-policy fact |
| Performance containment | passed | Non-Studio path is lightweight; Studio decision is memoized by observable state |
| Focused tests | passed | `4/4` decision tests; grouped decision/envelope/policy run `9/9` |
| TypeScript 7 and production build | passed | `pnpm run typecheck`, `pnpm run build` |
| Browser smoke | passed | `pnpm run qa:smoke`, `426s`, 0 console issues, 0 page errors |

## Implementation

`ProjectReleaseDecision.ts` normalizes a project and evidence matrix, creates
diagnostic and release decisions, selects a deterministic next action, and
validates semantic plus transport digests on parse. `App.ts` maps the existing
runtime, gate, envelope, policy, package, snapshot, and source-write facts into
that document. Build Readiness and Trust Chain expose the same blockers, while
the bridge provides the full document for QA and tooling.

The browser package now contains the required
`studio/project-release-decision.json`. `package-manifest.json` carries a
compact release summary and the same semantic digest, allowing a reopened
consumer to compare the decision without relying on generated timestamps.

## Browser evidence

`.scratch/qa/qa-smoke/diagnostics.json` records:

- `status = passed`
- `0` page errors and `0` console issues
- Build and Evidence schema `mugen-web-sandbox/project-release-decision/v0`
- diagnostic exportable `true`
- releaseable `false`
- one explicit blocker from the current asset-policy evidence
- 12 Trust Chain rows, including `project-release-decision`
- semantic digest `fnv1a32:a977b0e6` matching Build, Evidence, ZIP, and package
  manifest
- multi-context project storage conflict, remote reload, stale-save rejection,
  and local-copy preservation all passed

## Regression and correction

The first browser integration pass exposed a frame-loop regression because the
new decision recomputed provenance and policies from the diagnostics bridge on
every renderer completion. The implementation now returns a lightweight
non-Studio diagnostic document and memoizes the full Studio decision by project
state and output references. A subsequent full smoke pass completed in `426s`.

## Claim ceiling and next

This closes local decisioning and evidence visibility. It does not claim legal
approval, public publishing, external-engine parity, rollback/netplay, crash
recovery, or full MUGEN/IKEMEN parity. The next ordered Studio cut is `T09`
deterministic semantic export, with persisted reanalysis kept separate from
release.
