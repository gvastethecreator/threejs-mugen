# Issue 125 — Ikemen Projectile Z velocity multiplier

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime lifecycle`
- Priority: `P1`

## Objective

Carry the official third Projectile `velmul` component through typed
spawn/modify operations, Z motion, snapshots, and numeric
`ProjVar(velmul z)` reads.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles Projectile `velmul` with
up to three float components, initializes all axes to one, lets
ModifyProjectile replace all three values, multiplies every velocity axis
after acceleration, and exposes `velmul x|y|z` through `ProjVar`. The source is
MIT licensed.

## Acceptance fixture

- Preserve existing X/Y behavior while carrying an optional Z multiplier in
  Projectile and ModifyProjectile typed operations.
- Store a default Z multiplier of one, apply it after Z acceleration, reset it
  to one on terminal removal, and expose non-default values in snapshots.
- Return `ProjVar(velmul z)` through direct and redirected expression contexts.
- Prove spawn, normal Z tick, modify, terminal reset, redirects, and missing
  projectile behavior at deterministic seams.

## Claim ceiling

Do not claim perspective rendering, camera-relative depth, interpolation,
dynamic controller values, pause stacking, rollback/netplay serialization, or
complete Projectile 3D physics parity.

## Implementation

- Projectile and ModifyProjectile compile static three-axis `velmul` through
  the typed operation boundary with their official trailing defaults.
- Active X/Y/Z motion applies acceleration before its matching multiplier;
  terminal removal resets all three multipliers to one.
- Numeric `ProjVar(velmul x|y|z)` reads use the shared owner-relative selector,
  redirects, and caller expression context.
- Effect snapshots expose non-default three-axis multiplier state.

## Port ledger

- Source: Ikemen GO `develop` commit `149402f`, MIT.
- Local seam: `ControllerOps.ts` -> `ProjectileSystem.ts` -> shared expression
  contexts and effect snapshots.
- Bounded claim: static values and the existing three-axis Projectile motion
  lifecycle; the claim ceiling above remains open.

## Verification

- Focused tests: 8 files / 292 tests passed.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, and
  `pnpm check:redirect-boundary` passed.
- `pnpm qa:trace`: 686/686 passed (652 required, 34 optional).
- Full suite: 13 failed files / 58 failed tests / 3370 passed / 3428 total.
  Failures remain in the inherited retired-roster, Studio/project expectation,
  movement-expectation, and imported-log-label families; no T551 focal test
  failed.
