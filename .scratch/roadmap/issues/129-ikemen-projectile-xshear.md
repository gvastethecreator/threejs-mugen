# Issue 129 — Ikemen Projectile X shear

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime presentation`
- Priority: `P1`

## Objective

Carry official Projectile `projxshear` through typed spawn/modify operations,
live sprite presentation, snapshots, and numeric `ProjVar(xshear)` reads.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles `projxshear` as one float,
stores it on Projectile spawn, lets ModifyProjectile replace it, exposes it
through `ProjVar`, and applies the shear matrix before rotation during sprite
drawing. The source is MIT licensed.

## Acceptance fixture

- Compile static `projxshear` for Projectile and ModifyProjectile through the
  typed operation boundary.
- Store a finite value on `RuntimeProjectile`, expose it in effect/runtime
  snapshots and numeric `ProjVar(xshear)` reads, including redirects.
- Apply a bounded X-by-Y deformation to the live Three.js sprite before its
  rotation and reset geometry when the value returns to zero.
- Prove zero default, authored spawn, modify, direct/redirected reads,
  snapshots, renderer deformation, and missing-projectile behavior.

## Claim ceiling

This is a bounded centered-quad approximation. Do not claim exact Ikemen
anchor correction, aspect/localcoord compensation, tiling, focal-length or
projection modes, shadow/reflection shear, dynamic controller values,
rollback/netplay serialization, or complete Projectile transform parity.

## Implementation ledger

- `ControllerOps` compiles static Projectile and ModifyProjectile
  `projxshear` into the typed controller boundary.
- `RuntimeProjectile` owns a finite shear with zero default; ModifyProjectile
  replaces it and `ProjVar(xshear)` reads it through direct and redirected
  contexts.
- Effect/runtime/trace snapshots omit zero and preserve authored values.
- `CharacterRenderer` deforms each mesh from cached base vertices before its
  rotations and restores the base quad when shear returns to zero.

## Verification

- Focused: 9 files / 279 tests passed.
- `pnpm typecheck`, `pnpm build`, architecture boundaries, redirect boundaries,
  and `git diff --check` passed.
- Trace corpus: 686/686 passed (652 required, 34 optional).
- Full suite: 3373/3431 passed; the inherited baseline remains 13 failed files /
  58 failed tests.
