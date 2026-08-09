# Issue 131 — Ikemen Projectile reflection

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime presentation`
- Priority: `P1`

## Objective

Carry official Projectile `projreflection` through typed spawn/modify state,
snapshots, and a bounded live reflected sprite.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles `projreflection` as one
integer, initializes Projectile reflection to `-1`, and lets ModifyProjectile
replace it. Drawing creates a reflection when the value is positive, suppresses
it at zero, and in the negative auto mode follows the Projectile's non-zero
shadow color. The source is MIT licensed.

## Acceptance fixture

- Compile static `projreflection` for Projectile and ModifyProjectile through
  the typed controller boundary.
- Store an integer on `RuntimeProjectile` with official default `-1`, replace it
  through ModifyProjectile, and expose non-default state in snapshots.
- Create a bounded mirrored Projectile sprite for positive values and for
  negative auto mode with non-zero `projshadow`; remove it at zero.
- Prove default auto, forced on, forced off, modify replacement, snapshots, live
  reflection creation/removal, and renderer cleanup.

## Claim ceiling

Do not claim exact Ikemen stage reflection intensity, color, alpha, fade range,
Y scale/delta, offsets, window clipping, shear/rotation/projection inheritance,
Z-offset geometry, dynamic controller values, rollback/netplay serialization,
or complete Projectile reflection parity.

## Implementation ledger

- `ControllerOps` compiles static Projectile and ModifyProjectile
  `projreflection` values into the typed controller boundary.
- `RuntimeProjectile` owns an integer reflection mode with official `-1`
  default; ModifyProjectile replaces it and non-default values reach
  effect/runtime/trace snapshots.
- `CharacterRenderer` creates a mirrored underlay for positive mode or negative
  auto mode with non-zero Projectile shadow color, and removes it at zero.

## Verification

- Focused: 9 files / 281 tests passed.
- `pnpm typecheck`, `pnpm build`, architecture boundaries, redirect boundaries,
  and `git diff --check` passed.
- Trace corpus: 686/686 passed (652 required, 34 optional).
- Full suite: 3375/3433 passed; the inherited baseline remains 13 failed files /
  58 failed tests.
