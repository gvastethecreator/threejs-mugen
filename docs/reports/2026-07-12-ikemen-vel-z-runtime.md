# Ikemen Vel Z runtime report

## Outcome

Root logical combat depth now has velocity authoring and scheduler integration independent from Three.js presentation.

## Supported

- `VelSet z`.
- `VelAdd z`.
- `VelMul z`.
- `Vel Z` expression trigger.
- Tick integration through `RuntimeKinematicsWorld`.
- Typed kinematic telemetry preserves Z values.

## Oracle

Pinned Ikemen-GO `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`:

- `src/bytecode.go` lines 5823-5889: VelSet/VelAdd/VelMul Z mutation.
- `src/char.go` lines 9687-9701: Z position integrates from Z velocity with X/Y.
- `src/char.go` lines 9706-9725: standing/crouching friction applies to X and Z.

## Evidence

- Focused: 5 files, 82 tests passed.
- TypeScript 7 typecheck passed.
- Full regression/build/boundary gates run before commit.

## Remaining physics boundary

Current sandbox kinematics does not model official S/C friction for X. Adding friction only to Z would create inconsistent physics, so shared X/Z friction ownership remains Wayfinder 129 work. PosFreeze/bind Z and stage depth bounds are also pending.
