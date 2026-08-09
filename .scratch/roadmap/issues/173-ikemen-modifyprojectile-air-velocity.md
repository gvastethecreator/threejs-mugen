# Issue 173 — Ikemen ModifyProjectile air velocity

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Port ModifyProjectile `air.velocity` X/Y/Z mutation through airborne
Projectile contact and close the current X/Y consumer gap.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` evaluates one to three floating
components, zeros omitted components, and replaces the selected live
Projectile HitDef air-velocity vector.

## Acceptance fixture

- Compile one-, two-, and three-component static values with zero defaults.
- Resolve bounded dynamic root/helper values with fractional fidelity.
- Mutate only selected live Projectiles.
- Prove later airborne hit contact consumes changed X/Y/Z velocity.

## Claim ceiling

Do not claim complete airborne common-state choreography, exact tick order,
rollback/netplay serialization, or full ModifyProjectile parity.

## Verification

- Five focused files: 580 passing tests plus the same 19 inherited
  `PlayableMatchRuntime` failures.
- Root/helper paths and airborne hit-contact X/Y/Z consumption pass.
- Full suite: 3412/3470 pass; the same 58 inherited failures remain.
- Typecheck/build, 686/686 traces, boundaries, and redirect-boundary pass.
