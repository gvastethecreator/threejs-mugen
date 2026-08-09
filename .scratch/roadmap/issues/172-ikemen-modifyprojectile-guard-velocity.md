# Issue 172 — Ikemen ModifyProjectile guard velocities

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Port ModifyProjectile `guard.velocity` and `airguard.velocity` mutation through
the existing ground/air guard-contact consumers.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` evaluates one to three floating
components for each field, zeros omitted components, and replaces the matching
selected live Projectile HitDef vector.

## Port ledger

- `adapted`: `src/bytecode.go`, `hitDef_guard_velocity` and
  `hitDef_airguard_velocity` in ModifyProjectile.
- `local extension`: typed static operation and bounded root/Helper expression
  resolution.
- `reused`: existing Projectile ground/air guard push and Y/Z velocity
  consumers.
- `omitted`: exact common-state choreography, rollback, and netplay.

## Acceptance fixture

- Compile one-, two-, and three-component static values with zero defaults.
- Resolve bounded dynamic root/helper values with fractional fidelity.
- Mutate only selected live Projectiles and preserve unmatched Projectiles.
- Prove later ground and air guard contacts consume the changed vectors.

## Claim ceiling

Do not claim complete guard common-state motion, exact tick order,
rollback/netplay serialization, or full ModifyProjectile parity.

## Verification

- Five focused files: 577 passing tests plus the same 19 inherited
  `PlayableMatchRuntime` failures.
- Root/helper paths and ground/air guard contact consumers pass.
- Full suite: 3409/3467 pass; the same 58 inherited failures remain.
- Typecheck/build, 686/686 traces, boundaries, and redirect-boundary pass.
