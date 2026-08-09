# Issue 130 — Ikemen Projectile shadow

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime presentation`
- Priority: `P1`

## Objective

Carry official Projectile `projshadow` RGB state through typed spawn/modify
operations, live shadow presentation, snapshots, and numeric
`ProjVar(shadow r|g|b)` reads.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles `projshadow` as one to
three integers, starts each Projectile at `[0,0,0]`, lets ModifyProjectile
replace only authored components, exposes all three channels through `ProjVar`,
and creates a shadow only when the packed RGB value is non-zero. The source is
MIT licensed.

## Acceptance fixture

- Compile one-to-three component `projshadow` for Projectile and
  ModifyProjectile without inventing omitted modify channels.
- Store integer RGB state on `RuntimeProjectile`; expose it in snapshots and
  numeric `ProjVar(shadow r|g|b)` reads, including redirects.
- Create and tint a bounded projectile shadow only for non-zero RGB and remove
  it after a zero ModifyProjectile value.
- Prove zero default, authored spawn, partial modify, direct/redirected reads,
  snapshots, live color, and missing-projectile behavior.

## Claim ceiling

Do not claim exact Ikemen stage shadow transform, alpha/intensity, projection,
focal length, shear/rotation inheritance, Z-offset geometry, reflection,
dynamic controller values, rollback/netplay serialization, or complete
Projectile shadow parity.

## Implementation ledger

- `ControllerOps` compiles static one-to-three-channel Projectile and
  ModifyProjectile `projshadow` values without inventing omitted channels.
- `RuntimeProjectile` owns integer RGB state with a zero default; partial
  ModifyProjectile values preserve omitted channels and `ProjVar` exposes all
  three channels through direct and redirected contexts.
- Effect/runtime/trace snapshots omit zero colors and preserve authored RGB.
- `CharacterRenderer` creates a bounded tinted shadow only for non-zero
  Projectile RGB and removes it when the color returns to zero.

## Verification

- Focused: 9 files / 280 tests passed.
- `pnpm typecheck`, `pnpm build`, architecture boundaries, redirect boundaries,
  and `git diff --check` passed.
- Trace corpus: 686/686 passed (652 required, 34 optional).
- Full suite: 3374/3432 passed; the inherited baseline remains 13 failed files /
  58 failed tests.
