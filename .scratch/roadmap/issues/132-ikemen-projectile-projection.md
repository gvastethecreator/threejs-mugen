# Issue 132 — Ikemen Projectile projection

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime presentation`
- Priority: `P1`

## Objective

Carry official Projectile `projprojection` and `projfocallength` through typed
spawn/modify state, snapshots, and bounded live sprite projection.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` accepts `orthographic`,
`perspective`, and `perspective2` projection names, starts new Projectile state
at orthographic, treats a non-positive focal length as `2048` during drawing,
and lets ModifyProjectile replace both fields. The source is MIT licensed.

## Acceptance fixture

- Compile static named `projprojection` and numeric `projfocallength` for
  Projectile and ModifyProjectile through the typed boundary.
- Store normalized projection and finite focal-length state on
  `RuntimeProjectile`; replace both through ModifyProjectile and expose
  non-default state in snapshots.
- Keep orthographic rendering stable and apply bounded focal-length perspective
  to the live Projectile quad.
- Prove defaults, authored spawn, modify replacement, snapshots, orthographic
  stability, perspective deformation, reset, and explicit `perspective2`
  handling.

## Claim ceiling

Do not claim exact Ikemen `perspective2`, camera/localcoord/Z compensation,
window clipping, anchor/aspect correction, stage shadow/reflection projection,
dynamic controller values, rollback/netplay serialization, or complete
Projectile projection parity.

## Implementation ledger

- `ControllerOps` compiles static named `projprojection` and numeric
  `projfocallength` for Projectile and ModifyProjectile.
- `RuntimeProjectile` stores official orthographic/zero defaults, replaces both
  values through ModifyProjectile, and projects non-default state into effect,
  runtime, and trace snapshots.
- `CharacterRenderer` preserves orthographic output, applies bounded focal
  perspective, resets geometry, and explicitly suppresses unsupported
  `perspective2` sprites.

## Verification

- Focused: 9 files / 282 tests passed.
- `pnpm typecheck`, `pnpm build`, architecture boundaries, redirect boundaries,
  and `git diff --check` passed.
- Trace corpus: 686/686 passed (652 required, 34 optional).
- Full suite: 3376/3434 passed; the inherited baseline remains 13 failed files /
  58 failed tests.
