# Issue 174 — Ikemen ModifyProjectile ground velocity

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Port component-wise ModifyProjectile `ground.velocity` mutation through the
grounded Projectile hit-contact consumer.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles X, Y, and Z separately.
The MUGEN value `n` preserves that component. Each supplied expression replaces
only its selected live Projectile HitDef component.

## Acceptance fixture

- Compile static X/Y/Z expressions and `n` component preservation.
- Resolve bounded dynamic root/helper components with fractional fidelity.
- Mutate only supplied components on selected live Projectiles.
- Prove later grounded hit contact consumes changed X/Y/Z velocity.

## Claim ceiling

Do not claim complete grounded common-state choreography, exact tick order,
rollback/netplay serialization, or full ModifyProjectile parity.

## Verification

- Five focused files: 583 passing tests plus the same 19 inherited
  `PlayableMatchRuntime` failures.
- Static, root/helper dynamic, `n` preservation, and grounded contact X/Y/Z
  consumption pass.
- Full suite: 3415/3473 pass; the same 58 inherited failures remain.
- Typecheck/build, 686/686 traces, boundaries, and redirect-boundary pass.
