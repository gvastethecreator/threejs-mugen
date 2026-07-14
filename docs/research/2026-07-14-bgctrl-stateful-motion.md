# Research: stateful BGCtrl motion

## Question

How can the Three.js stage adapter preserve the observable motion of the
recognized `VelSet`, `VelAdd`, `PosSet`, and `PosAdd` controllers without making
the renderer own mutable stage state?

## Primary source

- [Elecbyte MUGEN 1.1b1 background documentation](https://www.elecbyte.com/mugendocs-11b1/bgs.html)

The official reference defines `VelSet` as a velocity assignment, `VelAdd` as a
velocity increment, `PosSet` as an absolute coordinate assignment, and
`PosAdd` as a coordinate displacement. It also defines an initial layer
`velocity` parameter and the controller timer used by these operations.

## Decision

Keep stage snapshots immutable and resolve motion from the imported base layer
at the requested background tick. The pure resolver simulates the bounded motion
controllers from the current reset origin, applies controller operations in
authored order, integrates velocity once per tick, and projects the resulting
coordinates back into the existing `startX`/`startY` layer contract.

When a common parent/controller loop is available, the simulation starts at the
latest cycle boundary so the current bounded reset behavior remains deterministic.
Initial `velocity` is parsed and retained in the stage model and compatibility
report.

## Evidence

- `src/tests/StageDefParser.test.ts` proves imported initial velocity survives
  parsing.
- `src/tests/stageProjection.test.ts` proves a one-axis `VelSet` preserves the
  other initial velocity axis and integrates three ticks.
- Focal command: `pnpm vitest run src/tests/StageDefParser.test.ts src/tests/stageProjection.test.ts`
  passed 2 files / 17 tests.
- Batched TypeScript 7 check: `pnpm typecheck` passed.

## Claim ceiling

Allowed: deterministic bounded motion for recognized stage controllers and
initial layer velocity in the current renderer path.

Still blocked: full mutable multi-group controller state, exact pause ordering,
zoom/windowdelta/mask semantics, parallax mesh deformation, and full
MUGEN/IKEMEN stage compatibility.
