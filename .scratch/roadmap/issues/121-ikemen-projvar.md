# Issue 121 — Ikemen `ProjVar` projectile state read

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime reads`
- Priority: `P1`

## Objective

Compare the official Ikemen `ProjVar(id, index, param)` trigger with the live
projectile store. Add the smallest typed numeric read that reuses the
owner-relative index proven by T546.

## Source gate

The current official Ikemen reference selects projectiles owned by the caller.
The first argument filters by projectile ID, where `-1` accepts every owned
projectile. The second argument is the zero-based index in that filtered list.
The third argument selects projectile state. This argument order differs from
`ProjClsnOverlap`, which starts with the index.

## Implementation

- Dynamic projectile ID and index values select active caller-owned projectiles.
  Any negative ID accepts all IDs; negative indexes fail.
- Numeric identity, animation, position, velocity, acceleration, draw scale,
  velocity multiplier, priority, bounds, removal, hit capacity, time, and team
  side fields read directly from `RuntimeProjectile`.
- Redirect ownership and deterministic oldest-first indexing reuse the T546
  boundary. Coordinate-like values convert from projectile `localcoord` to the
  original caller's output `localcoord`.
- Missing projectiles and unsupported parameters return the expression
  undefined value without mutating projectile or combat state.

## Verification

- Focused: 5 files / 172 tests pass.
- Full suite: 3366/3424 tests pass; the remaining 58 failures are the inherited
  retired-roster, Studio, movement-expectation, and imported-log baseline.
- `pnpm typecheck`, `pnpm build`, `pnpm qa:trace` (686/686),
  `pnpm check:boundaries`, and `pnpm check:redirect-boundary` pass.
- No browser gate was needed because this slice does not change UI behavior.

## Claim ceiling

Do not claim flag/string parameters, camera-relative X correction,
palette/shadow/3D fields, full `ModifyProjectile` state parity, combat
arbitration, rollback/netplay serialization, or complete Ikemen `ProjVar`
parity.
