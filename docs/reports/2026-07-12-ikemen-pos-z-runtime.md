# Ikemen Pos Z runtime report

## Outcome

Root CNS can now author and query logical combat Z independently from visual Three.js Z.

## Supported

- `PosSet` static or dynamic `z`.
- `PosAdd` static or dynamic `z`.
- `Pos Z` expression trigger.
- Typed kinematic telemetry including `z`.
- Lazy logical-depth initialization for legacy runtime states.

## Oracle

Pinned Ikemen-GO `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `src/compiler_functions.go` lines 1194-1251: PosSet/PosAdd/VelSet/VelAdd share optional X/Y/Z parameter compilation.

## Evidence

- Focused compiler, kinematic controller, and expression suite: 3 files, 74 tests passed.
- Dynamic PosSet and PosAdd tests prove expression-evaluated Z mutation and typed operation values.
- `Pos Z = 12` expression test proves CNS readback.
- TypeScript 7 typecheck passed.
- Full regression/build/boundary gates run before commit.

## Deferred

Velocity Z requires a logical Z velocity field plus explicit movement integration and pause/physics ordering. It is not approximated through render position.
