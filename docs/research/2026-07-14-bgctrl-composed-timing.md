# Research: composed BGCtrl timing

## Question

How should the stage adapter represent a `BGCtrl` controller that has both an
explicit controller `looptime` and a parent `BGCtrlDef looptime` without
silently discarding one reset boundary?

## Primary source

- [Elecbyte MUGEN 1.1b1 background documentation](https://www.elecbyte.com/mugendocs-11b1/bgs.html)

The official contract describes a controller timer starting at round tick zero,
an inclusive `start`/`end` active window, an optional controller `looptime`, and
a parent `BGCtrlDef looptime` that resets the timers of its contained
controllers.

## Decision

Keep the existing effective `timing.loopTime` field for compatibility, and add
`timing.groupLoopTime` when the source has a parent reset period. The pure stage
projection helper now computes the elapsed controller tick from the most recent
applicable controller or parent reset. This preserves the inherited-group case
and handles explicit controller/group periods that do not divide each other.

The report and Studio controller row expose the second period only when it adds
information. No stage asset or binary fixture is added.

## Evidence

- `src/tests/StageDefParser.test.ts`: parent and explicit controller periods
  remain distinct after parsing.
- `src/tests/stageProjection.test.ts`: a parent reset at tick 10 cancels the
  stale explicit-loop activation that would otherwise remain active.
- Focal command: `pnpm vitest run src/tests/StageDefParser.test.ts src/tests/stageProjection.test.ts`
  passed 2 files / 15 tests.

## Claim ceiling

Allowed: deterministic composed `start`/`end`/loop boundary resolution for the
bounded renderer executor.

Still blocked: exact mutable velocity/position history, `Enabled` animation
pause semantics, zoom/windowdelta/mask parity, controller pause ordering, and
full MUGEN/IKEMEN stage compatibility.
