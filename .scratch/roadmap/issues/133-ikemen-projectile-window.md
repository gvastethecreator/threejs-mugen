# Issue 133 — Ikemen Projectile window

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime presentation`
- Priority: `P1`

## Objective

Carry official Projectile `projwindow` through typed spawn/modify state,
snapshots, local-coordinate conversion, and bounded live sprite clipping.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles `projwindow` as four
floats, initializes Projectile window state to zero, scales authored values into
the redirected owner's coordinate space, lets ModifyProjectile replace all four
values, sorts each axis before drawing, and applies the result as a sprite-local
scissor rectangle. The source is MIT licensed.

## Acceptance fixture

- Compile exactly four static numeric `projwindow` values for Projectile and
  ModifyProjectile through the typed controller boundary.
- Store a finite four-value tuple with official zero defaults, replace it through
  ModifyProjectile, and expose raw effect plus local-coordinate-scaled runtime
  and trace snapshots.
- Clip live Projectile quad geometry and UVs, reset on zero window, and suppress
  fully disjoint windows.
- Prove spawn, defaults, replacement/reset, snapshots, local-coordinate scaling,
  partial clipping, UV mapping, reset, and disjoint culling.

## Claim ceiling

Do not claim exact GPU scissor behavior, camera/aspect/zoom compensation,
redirected cross-localcoord scaling, exact rotated/perspective window geometry,
shadow/reflection/afterimage clipping parity, dynamic controller values,
rollback/netplay serialization, or complete Projectile window parity.

## Implementation ledger

- `ControllerOps` carries an exact static four-float window tuple for Projectile
  and ModifyProjectile.
- `RuntimeProjectile` owns zero-default window state, replacement semantics, raw
  effect snapshots, and renderer/trace local-coordinate conversion.
- `CharacterRenderer` intersects the authored window with the live sprite quad,
  updates geometry and UVs, resets the full quad, and culls disjoint windows.

## Verification

- Focused: 3 files / 112 tests passed.
- `pnpm typecheck`, `pnpm build`, architecture boundaries, and redirect
  boundaries passed.
- Trace corpus: 686/686 passed (652 required, 34 optional).
- Full suite: 3378/3436 passed; the inherited baseline remains 13 failed files /
  58 failed tests.
