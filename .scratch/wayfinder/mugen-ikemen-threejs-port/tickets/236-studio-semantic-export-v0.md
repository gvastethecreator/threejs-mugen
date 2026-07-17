# Implement deterministic Studio semantic export/v0

Date: 2026-07-17
Type: task
Status: resolved
Blocked by: None

Implementation commit: `24b87108`

## Question

Can Studio export a reopenable semantic artifact whose project revision,
evidence identities, blockers, and next action remain stable when observation
time changes, while keeping diagnostic packaging separate from release?

## Answer

Yes, at bounded local scope. `StudioSemanticExport/v0` is a parser-validated
document derived from `ProjectReleaseDecision/v0`. Its semantic payload excludes
`generatedAt`; its transport payload retains `generatedAt` and receives a
separate digest. Evidence facts are identity-preserving projections, while both
diagnostic and release decisions retain blocker details and next actions.

## Contract

- Schema: `mugen-web-sandbox/studio-semantic-export/v0`.
- Source identity: `project-release-decision/v0` schema, id, and semantic digest.
- Semantic identity: project state, producer, evidence identities, decision
  state, blocker ids/details, warnings, summary, and next actions.
- Transport identity: semantic payload plus observation time.
- Fail-closed parse: schema, project, producer, source decision, evidence,
  decisions, summary, semantic digest, and transport digest are validated.
- ZIP path: required `studio/semantic-export.json`; package manifest mirrors
  schema, semantic digest, evidence count, and diagnostic/release flags.

## Evidence

- `src/tests/StudioSemanticExport.test.ts`: focused `4/4`.
- Grouped release/envelope/semantic focal run: `10/10`.
- `pnpm run typecheck`: passed under TypeScript 7.
- `pnpm run build`: passed; existing large-chunk advisory remains.
- `node --check scripts/qa_smoke.cjs` and scoped diff-check: passed.
- `pnpm run qa:smoke`: passed in started-Vite mode in `459s`; `0` page errors
  and `0` console issues.
- `.scratch/qa/qa-smoke/diagnostics.json`: Build and Evidence semantic digest
  `fnv1a32:bae3bd84`; ZIP JSON and package manifest match; required file and
  manifest entry are present; Trust Chain has `13` rows and targets
  `studio-semantic-export:v0`.
- Focal tamper cases reject both semantic-field mutation and transport-digest
  mutation.

## Claim ceiling

This proves deterministic local semantic packaging and reopen inspection for
the current Studio evidence graph. The local FNV-1a digest is an identity and
tamper-detection aid, not a cryptographic signature. The contract is not a
claim of RFC 8785 conformance, public publishing, crash durability, external
engine parity, or full MUGEN/IKEMEN parity. `PackageAnalysis` reanalysis/diff
remains the separate T27 workflow.

## Next

Advance to `T10` redirect lease characterization. Keep `T27` reanalysis/diff
behind its declared T26 authority dependency; T09 only supplies the stable
semantic export identity it will later consume.
