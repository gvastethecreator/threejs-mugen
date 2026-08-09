# Issue 127 — Ikemen Projectile angle

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime presentation`
- Priority: `P1`

## Objective

Carry official Projectile `projangle` through typed spawn/modify operations,
live Z-axis sprite rotation, snapshots, and numeric `ProjVar(projangle)` reads.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles `projangle` as one float,
stores it as the first Projectile rotation component, lets ModifyProjectile
replace it, copies the rotation into sprite draw data, and exposes the value
through `ProjVar`. The source is MIT licensed.

## Acceptance fixture

- Compile static `projangle` for Projectile and ModifyProjectile through the
  existing typed operation boundary.
- Store the angle on `RuntimeProjectile`, expose it in effect snapshots and
  numeric `ProjVar(projangle)` reads, including redirected contexts.
- Project the angle to `CharacterRuntimeState.renderAngle` so the existing
  `CharacterRenderer` rotates the live Projectile mesh.
- Prove spawn default/authored values, modify, snapshot projection,
  direct/redirected reads, and missing-projectile behavior.

## Claim ceiling

Do not claim `projxangle`, `projyangle`, perspective projection, shear,
rotation-aware collision, dynamic controller values, interpolation,
rollback/netplay serialization, or complete Projectile transform parity.

## Implementation ledger

- `ControllerOps` compiles static Projectile and ModifyProjectile `projangle`
  into the typed controller boundary.
- `RuntimeProjectile` owns a finite angle with official zero default;
  ModifyProjectile replaces it and `ProjVar(projangle)` reads it through direct
  and redirected contexts.
- Effect snapshots expose non-zero angle metadata. Actor snapshots project it
  to `renderAngle`, and `CharacterRenderer` applies the live Z rotation.
- Default zero is omitted from actor snapshots so existing trace artifacts keep
  their checksums.

## Verification

- Focused: 9 files / 278 tests passed.
- `pnpm typecheck`, `pnpm build`, architecture boundaries, redirect boundaries,
  and `git diff --check` passed.
- Trace corpus: 686/686 passed (652 required, 34 optional).
- Full suite: 3372/3430 passed; the inherited baseline remains 13 failed files /
  58 failed tests.
