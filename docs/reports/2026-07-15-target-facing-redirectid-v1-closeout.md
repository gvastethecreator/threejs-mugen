# TargetFacing RedirectID v1 closeout

Date: 2026-07-15

## Status

Implemented and verified as a bounded root-only IKEMEN compatibility slice.
Runtime commit: `94eedd41`.

## Delivered behavior

Active CNS and imported State -1 setup now admit `TargetFacing` through the
explicit `RedirectID` route. A live root PlayerID destination owns mutation of
its remembered target's facing while the caller retains the authored value and
target ID context. Missing RedirectID remains local. Invalid, negative,
unavailable, disabled, destroyed, malformed, and legacy routes fail closed
before mutation.

The route is profile-gated to `ikemen-go` and limited to live root fighters.
Positive values match the executing destination owner's facing; negative values
apply the opposite direction, following the existing TargetFacing contract.

## Evidence

- Required active artifact:
  `synthetic-imported-target-facing-redirect`, checksum `85d7fa7b`.
- Required State -1 artifact:
  `synthetic-imported-target-facing-state-entry-redirect`, checksum `63d2ec84`.
- Full trace QA: `pnpm qa:trace` passed 617/617 artifacts.
- Required/optional split: 583 required, 34 optional, 0 skipped.
- Affected runtime suites: 5 files, 898/898 tests passed with the deliberate
  15-second timeout for the unchanged slow team handoff case.
- TypeScript 7 check: `pnpm typecheck` passed.
- Trace runner syntax: `node --check scripts/qa_traces.cjs` passed.
- Diff hygiene: `git diff --check` passed.

The paired traces prove reciprocal target links, distinct caller and
destination target memory, target ID filtering, destination-owned facing
mutation, and typed controller/operation telemetry. No score movement,
browser smoke, helper destination, team aggregation, or full parity claim is
made.

## Audit

The closeout was checked across typed compiler lowering, State -1 setup
classification, active/state-entry dispatch, root PlayerID resolution,
TargetSystem facing semantics, telemetry, required trace registration, and
invalid RedirectID tests. Runtime code was committed separately from this
documentation. Unrelated roadmap edits remain outside the docs commit.

## Official basis

- [IKEMEN RedirectID state-controller documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  defines optional PlayerID redirection for state controllers and warns that
  processing order can limit individual controllers.
- [Elecbyte TargetFacing documentation](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
  defines positive `value` as matching the executing player's facing,
  negative `value` as the opposite, and optional target ID filtering.

## Boundary and next move

TargetBind, TargetState, helper/projectile/team ownership, exact multi-target
ordering, persistence, rollback/netplay, presentation, score, and full
MUGEN/IKEMEN parity remain open. Next: research one independent Target* family
before implementation.
