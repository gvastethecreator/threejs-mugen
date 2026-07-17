# ProjectReleaseDecision/v0 research note

Date: 2026-07-17
Wayfinder ticket: 235
Implementation: `2da0ece2`

## Scope

T07 follows the existing `GateEvidence/v0`, `AssetReleasePolicy/v0`,
`EvidenceEnvelope/v0`, `PackageAnalysis/v1`, and `SourceWriteReceipt/v1`
contracts. The research question is how to join those facts without turning
diagnostic packaging into a release or parity claim.

## Decision

`ProjectReleaseDecision/v0` carries a project identity and two independent
decisions:

- `diagnostic`: may export the current facts and blockers for inspection.
- `release`: may only release when all required facts are passed, current, and
  revision-safe.

The document keeps semantic identity separate from transport time. Its
semantic digest excludes `generatedAt`, so Build, Evidence, and ZIP consumers
can compare the same decision even when each surface materializes a fresh
transport document. Parser checks fail closed on schema, nested decision,
semantic digest, or transport digest mismatches.

## Evidence matrix

| Fact | Required | Release treatment |
| --- | --- | --- |
| Project storage revision, dirty state, conflict | yes | Missing revision, dirty state, or conflict blocks release |
| Runtime manifest and trace | yes | Missing/failed facts block; warnings remain visible |
| GateEvidence and EvidenceEnvelope | yes | Failed, stale, unknown, or wrong project revision blocks |
| AssetReleasePolicy aggregate | yes | Any blocked/unknown policy blocks; diagnostic export remains available |
| Source package linkage | yes | Missing linked package blocks imported-project release |
| Promoted compatibility snapshot | yes | Missing/failed snapshot blocks; partial is visible as warning |
| PackageAnalysis/v1 | optional | Scanner diagnostics are exported but do not alone block release |
| SourceWriteReceipt/v1 | conditional | When present, failed or blocked write evidence blocks release |

The current browser fixture demonstrates the intended ceiling: Build and
Evidence report `diagnosticExportable = true`, `releaseable = false`, and one
explicit unknown asset-policy blocker. This is a useful release decision, not
a claim that the project is legally cleared or engine-compatible.

## Source basis

The evidence model remains aligned with the browser's real file-writing
boundary: `FileSystemFileHandle.createWritable()` provides an exclusive
writer/close boundary but not an application-level recovery journal. The
existing implementation therefore keeps preimages and receipts application
owned, and this decision layer consumes those receipts as evidence rather than
inventing durability claims.

- [WHATWG File System Standard: createWritable](https://fs.spec.whatwg.org/#api-filesystemfilehandle-createwritable)
- [MDN: FileSystemFileHandle.createWritable()](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable)

## Verification

- Model tests: `4/4` ProjectReleaseDecision tests.
- Grouped focal tests: `9/9` decision, envelope, and asset policy tests.
- TypeScript 7 check and production build passed; Vite retained the existing
  large-client-chunk warning only.
- Full browser smoke passed in `426s` with `0` page errors and `0` console
  issues. Runtime and Studio storage conflict paths remained green after the
  first integration exposed a frame-loop regression; the final code memoizes
  the Studio decision by observable project/output state.

Next research question: deterministic semantic export and persisted
reanalysis, without conflating those artifacts with a public release.
