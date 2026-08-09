# Issue 128 — Ikemen Projectile X/Y angles

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime presentation`
- Priority: `P1`

## Objective

Carry official Projectile `projxangle` and `projyangle` through typed
spawn/modify operations, live sprite rotation, snapshots, and numeric
`ProjVar(angle x|y)` reads.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles both parameters as one
float. Spawn stores X in Projectile rotation component 1 and Y in component 2;
ModifyProjectile replaces the same components. `ProjVar(angle x|y)` returns
them. Sprite drawing applies X rotation with a negative sign and Y rotation
with a positive sign before the existing Z rotation. The source is MIT
licensed.

## Acceptance fixture

- Compile static `projxangle` and `projyangle` for Projectile and
  ModifyProjectile through the typed operation boundary.
- Store both finite values on `RuntimeProjectile`, expose them in effect
  snapshots and numeric `ProjVar(angle x|y)` reads, including redirects.
- Project non-zero values to typed runtime render fields and apply the bounded
  X/Y rotations to the live Three.js sprite mesh.
- Prove zero defaults, authored spawn, modify, direct/redirected reads,
  snapshots, renderer axes, and missing-projectile behavior.

## Claim ceiling

This is an orthographic Three.js projection of the official rotation
components. Do not claim Ikemen focal-length/perspective equivalence, facing
reflection parity, shear, interpolation, rotation-aware collision, dynamic
controller values, rollback/netplay serialization, or complete Projectile
transform parity.

## Implementation ledger

- `ControllerOps` compiles both static parameters for Projectile and
  ModifyProjectile.
- `RuntimeProjectile` owns finite X/Y angle values with zero defaults;
  ModifyProjectile replaces them and `ProjVar(angle x|y)` reads them through
  direct and redirected contexts.
- Effect/runtime snapshots omit zero defaults, retain authored values, and the
  trace projection carries non-zero axes without changing old checksums.
- `CharacterRenderer` applies negative X and positive Y rotations and clears
  stale axes when later snapshots omit them.

## Verification

- Focused: 9 files / 278 tests passed.
- `pnpm typecheck`, `pnpm build`, architecture boundaries, redirect boundaries,
  and `git diff --check` passed.
- Trace corpus: 686/686 passed (652 required, 34 optional).
- Full suite: 3372/3430 passed; the inherited baseline remains 13 failed files /
  58 failed tests.
