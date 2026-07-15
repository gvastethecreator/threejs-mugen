# TargetVelAdd/TargetVelSet RedirectID v1 closeout

Date: 2026-07-15

## Status

Implemented and verified as a bounded root-only IKEMEN compatibility slice.
Runtime commit: `477078e7`.

## Delivered behavior

Active CNS and imported State -1 setup now admit `TargetVelAdd` and
`TargetVelSet` through the explicit `RedirectID` route. A live root PlayerID
destination owns mutation of its remembered target while the caller retains
typed x/y/ID values and RedirectID expression context. Missing RedirectID
remains local. Invalid, negative, unavailable, disabled, destroyed,
malformed, and legacy routes fail closed before mutation.

The route is profile-gated to `ikemen-go` and limited to live root fighters.
The existing velocity contract remains explicit: `TargetVelAdd` applies x in
target-facing space; `TargetVelSet` uses the executing destination owner for
its x-direction decision in the current target-world contract. This report
does not generalize that rule to other target controllers.

## Evidence

- Required active artifact:
  `synthetic-imported-target-velocity-redirect`, checksum `4f62267d`.
- Required State -1 artifact:
  `synthetic-imported-target-velocity-state-entry-redirect`, checksum
  `dedf1499`.
- Full trace QA: `pnpm qa:trace` passed 615/615 artifacts.
- Required/optional split: 581 required, 34 optional, 0 skipped.
- Affected runtime suites: 5 files, 893/893 tests passed.
- TypeScript 7 check: `pnpm typecheck` passed.
- Trace runner syntax: `node --check scripts/qa_traces.cjs` passed.
- Diff hygiene: `git diff --check` passed.

The paired traces prove reciprocal target links, distinct caller and
destination target memory, target ID filtering, velocity mutation, and typed
controller/operation telemetry. No score movement, browser smoke, helper
destination, team aggregation, or full parity claim is made.

## Audit

The closeout was checked across typed compiler lowering, State -1 setup
classification, active/state-entry dispatch, root PlayerID resolution,
TargetSystem velocity semantics, telemetry, required trace registration, and
invalid RedirectID tests. Only the runtime feature files and this feature's
documentation were staged for the feature commits; unrelated roadmap edits
remain outside the commit.

## Official basis

- [IKEMEN RedirectID state-controller documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  defines the optional PlayerID redirection and warns that processing order can
  limit individual controllers.
- [Elecbyte TargetVelAdd documentation](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
  defines additive target velocity, x/y values, target-facing x behavior, and
  optional target ID filtering.
- [Elecbyte TargetVelSet documentation](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
  defines replacement target velocity, x/y values, executing-player x
  direction, and optional target ID filtering.

## Boundary and next move

TargetFacing, TargetBind, TargetState, helper/projectile/team ownership, exact
multi-target ordering, persistence, rollback/netplay, presentation, score,
and full MUGEN/IKEMEN parity remain open. Next: research and select one
independent Target* boundary before implementation.
