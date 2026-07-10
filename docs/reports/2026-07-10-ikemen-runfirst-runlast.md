# IKEMEN RunFirst and RunLast closeout

Date: 2026-07-10
Area: IKEMEN runtime profile / root scheduling / trace gates

## Outcome

Explicit `ikemen-go` matches now consume previous-tick root `AssertSpecial` `RunFirst` / `RunLast` before MoveType/id priority. Exclusive flags use source-backed priorities `100/-100`; both together neutralize. MUGEN/unknown matches remain unchanged.

## Evidence

- Required artifact: `synthetic-imported-ikemen-runfirst.json`, trace checksum `56e17803`, final checksum `aabad0c5`.
- Aggregate trace: 530/530, with 499 required and 31 optional.
- Focused compiler/scheduler/runtime/trace proof passes 5 files / 651 tests.
- Full suite passes 158 files / 1560 tests; production build and architecture boundaries pass.
- TypeScript 7 typecheck passes.
- Source decision: `docs/research/2026-07-10-ikemen-runfirst-runlast.md`.

## Global area report

- IKEMEN runtime: two-root scheduling now covers previous-tick MoveType/id plus exclusive/conflicting RunFirst/RunLast.
- Trace infrastructure: gates can require exact actor order for a named `MatchTickSchedule/v0` phase.
- MUGEN/native: default `unknown` and explicit `mugen-1.1` preserve pair order; existing traces remain green.
- Studio/renderer/assets: unchanged; no visual smoke required.
- Scores: unchanged.

## Claims

Allowed: an explicit IKEMEN 1v1 root match can consume previous-tick `RunFirst` / `RunLast` with source-backed priority and mutual-neutralization semantics.

Blocked: `RunOrder`, helpers/appended actors, teams/simul/tag, exact pause/hitpause flag lifetime, simultaneous Pause overwrite, rollback, and full IKEMEN scheduling parity.
