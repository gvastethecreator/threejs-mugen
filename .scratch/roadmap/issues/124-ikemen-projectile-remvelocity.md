# Issue 124 — Ikemen Projectile removal velocity

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime lifecycle`
- Priority: `P1`

## Objective

Carry official Projectile `remvelocity` through typed spawn/modify operations,
live projectile state, terminal removal movement, snapshots, and numeric
`ProjVar(remvelocity x|y|z)` reads.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles `remvelocity` as a
three-component Projectile parameter, stores it on the live Projectile, and
allows ModifyProjectile to replace it. At the active-to-removing transition,
Ikemen copies `remvelocity` into current velocity, clears acceleration, and
resets velocity multiplication to one. `ProjVar` returns all three components
with caller-local coordinate conversion. The source is MIT licensed.

## Acceptance fixture

- Compile static `remvelocity` for Projectile and ModifyProjectile through the
  existing typed operation boundary.
- Store authored removal velocity on `RuntimeProjectile` and expose it in
  snapshots and numeric `ProjVar` reads, including caller-local conversion;
  apply current facing when terminal world velocity begins.
- On terminal playback, replace active velocity with removal velocity, clear
  acceleration, reset velocity multiplication, and move for the bounded
  terminal animation lifetime.
- Prove spawn, modify, hit/timeout transition, X/Y/Z reads, redirects, and
  missing-projectile behavior at the nearest deterministic seams.

## Claim ceiling

Do not claim exact `removefacing`, invalid/removal AIR fallback, post-removetime
hit admission, interpolation, pause stacking, dynamic controller values,
rollback/netplay serialization, or complete Projectile lifecycle parity.

## Implementation

- Projectile and ModifyProjectile compile static three-axis `remvelocity` into
  the typed operation boundary and live `RuntimeProjectile` state.
- Numeric `ProjVar(remvelocity x|y|z)` reads use the active owner-relative
  selector, redirects, and caller `localcoord` conversion.
- Terminal playback applies current facing to X, replaces active velocity,
  clears acceleration, resets velocity multiplication, and advances X/Y/Z for
  the bounded removal AIR lifetime.
- Effect snapshots expose non-default authored removal velocity.

## Port ledger

- Source: Ikemen GO `develop` commit `149402f`, MIT.
- Local seam: `ControllerOps.ts` -> `ProjectileSystem.ts` -> shared expression
  contexts and effect snapshots.
- Bounded claim: static values and the current terminal AIR actor lifecycle;
  the claim ceiling above remains open.

## Verification

- Focused tests: 8 files / 292 tests passed.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, and
  `pnpm check:redirect-boundary` passed.
- `pnpm qa:trace`: 686/686 passed (652 required, 34 optional).
- Full suite: 13 failed files / 58 failed tests / 3370 passed / 3428 total.
  Failures remain in the inherited retired-roster, Studio/project expectation,
  movement-expectation, and imported-log-label families; no T550 focal test
  failed.
