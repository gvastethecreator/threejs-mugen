# Ikemen Vel Z runtime report

## Outcome

Root logical combat depth now has velocity authoring and scheduler integration independent from Three.js presentation.

## Supported

- `VelSet z`.
- `VelAdd z`.
- `VelMul z`.
- `Vel Z` expression trigger.
- Tick integration through `RuntimeKinematicsWorld`.
- Imported standing/crouching friction shared by X and logical Z.
- Player-local standing stop threshold derived from `localcoord.width / 320`.
- Full/default root `PosFreeze` preserves logical Z with X/Y at the end-of-tick constraint boundary.
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

## Friction boundary

Imported roots now model ordinary S/C friction consistently across X/Z. Root full/default `PosFreeze` preserves logical Z; the nonstandard axis-specific X/Y compatibility route intentionally leaves Z unfrozen. Get-hit `HitDef` stand/crouch friction overrides, binds, corner-push ordering, helper/projectile physics, and stage depth bounds remain pending.

## Required trace

`synthetic-imported-ikemen-active-root-depth-velocity` executes `VelSet z=20`, advances one normal kinematics tick, then activates HitDef. Admission changes from `missing-move` to depth-driven `no-contact`; life and targets remain unchanged. Trace QA passes 554/554 artifacts, 523 required; checksum `6cf14866`.
