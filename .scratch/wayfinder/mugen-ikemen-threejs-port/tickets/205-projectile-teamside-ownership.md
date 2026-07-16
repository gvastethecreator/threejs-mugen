# Implement Projectile TeamSide ownership

Type: task
Status: selected
Blocked by: None

## Question

Can the runtime carry IKEMEN `Projectile`/`ModifyProjectile` `teamside`
through typed projectile state and reproduce the bounded ownership behavior
that lets an explicitly opposite-side projectile hit its owner and interact
with the owner's other projectiles?

## Scope

- compile static `teamside` on `Projectile` and `ModifyProjectile`;
- resolve dynamic `ModifyProjectile teamside` in the existing caller context;
- carry the normalized side through runtime projectile state and snapshots;
- schedule owner self-contact only for an explicitly opposite-side projectile;
- schedule same-owner projectile clashes when at least one projectile opts into
  the opposite-side behavior;
- preserve default owner-local behavior when `teamside` is omitted or equal to
  the owner's side;
- fail closed for invalid side values.

Do not widen projectile HitDef parity, helper custom states, projectile
RedirectID, `ProjTypeCollision`, score, rollback/netplay, or renderer claims.

## Evidence required

- compiler/runtime unit coverage for static and dynamic `teamside`;
- owner self-contact and same-owner clash coverage;
- default and invalid values remain inert;
- TypeScript 7 check, focused projectile/effect/runtime batch, and diff hygiene;
- closeout report with source boundary and no score movement.

## Research basis

- [IKEMEN state-controller RedirectID reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)
- [IKEMEN changed-controller Projectile parameters](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29)
- `docs/research/2026-07-16-projectile-teamside-ownership.md`
- `docs/adr/0006-runtime-redirected-target-dispatch.md`

## Exit

The projectile runtime owns explicit TeamSide state, executes the documented
bounded self-contact/same-owner clash behavior, preserves default semantics,
and exposes evidence without claiming broader team or projectile parity.
