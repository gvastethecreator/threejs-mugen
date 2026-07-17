# Studio Semantic Export/v0 closeout

Date: 2026-07-17
Wayfinder ticket: 236
Implementation commit: `24b87108`

## Global status

| Area | Status | Evidence |
| --- | --- | --- |
| Semantic export contract | passed | Parser-validated `studio-semantic-export/v0` with semantic and transport digests |
| Determinism | passed | Observation-time changes preserve canonical bytes and semantic digest |
| Evidence continuity | passed | Project revision, evidence identities, blockers, and next actions survive projection |
| Tamper detection | passed | Focused semantic-field and transport-digest mutations are rejected |
| Studio integration | passed | Evidence, Build Readiness, Trust Chain, bridge, and required ZIP consume one document |
| ZIP reopen inspection | passed | Required JSON and manifest summary agree on schema, digest, count, and flags |
| Focused tests | passed | Semantic `4/4`; grouped release/envelope/semantic `10/10` |
| TypeScript 7 and production build | passed | `pnpm run typecheck`, `pnpm run build` |
| Browser smoke | passed | `pnpm run qa:smoke`, `459s`, 0 console issues, 0 page errors |

## Implementation

`StudioSemanticExport.ts` derives a compact, versioned semantic projection from
`ProjectReleaseDecision/v0`. The semantic payload includes the project state,
source decision identity, evidence identities, both decision intents, blocker
details, warnings, summary, and next actions. `generatedAt` is excluded from
that payload and retained only in the transport payload. Parsing validates both
layers and fails closed on mismatches.

`App.ts` exposes the same document in the Studio evidence summary and bridge,
adds `semantic-export` to Build Readiness and Trust Chain, and writes
`studio/semantic-export.json` into every required project bundle. The package
manifest carries a compact semantic summary for reopened inspection.

## Browser evidence

The final `pnpm run qa:smoke` output reports `status = passed`; the generated
`.scratch/qa/qa-smoke/diagnostics.json` records:

- smoke `status = passed`
- `0` page errors and `0` console issues
- Build/Evidence schema
  `mugen-web-sandbox/studio-semantic-export/v0`
- Build semantic digest `fnv1a32:bae3bd84`
- Evidence semantic digest `fnv1a32:bae3bd84`
- ZIP semantic digest `fnv1a32:bae3bd84`
- package manifest semantic digest `fnv1a32:bae3bd84`
- required ZIP file and required manifest entry present
- diagnostic exportable `true`; releaseability matches the source decision
- `13` Trust Chain rows, with target `studio-semantic-export:v0`

## Verification and correction

The first focal test assumed the global next action would always be
`save-project`. The source decision intentionally sorts blockers and selects
the first deterministic blocker action, so the test now asserts equality with
that selected blocker action. No runtime or browser regression remained after
the correction.

The production build retains the existing large-chunk advisory. No new page or
console errors were introduced by the semantic export integration.

## Claim ceiling and next

This closes deterministic local Studio diagnostic packaging and bundle
inspection. The local FNV-1a digest is not a cryptographic signature. This does
not claim public publishing, crash recovery, cross-runtime JCS conformance,
PackageAnalysis reanalysis/diff, external-engine parity, rollback/netplay, or
full MUGEN/IKEMEN parity.

Next ordered Wayfinder cut: `T10` redirect lease characterization. `T27`
PackageAnalysis reanalysis/diff remains separate and can consume T09 identity
once its T26 rule-authority dependency is closed.
