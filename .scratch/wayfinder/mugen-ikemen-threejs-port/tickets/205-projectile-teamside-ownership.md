# Implement Projectile TeamSide ownership

Type: task
Status: completed
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

## Outcome

- `Projectile` and `ModifyProjectile` now lower static `teamside` into typed
  operations; dynamic `ModifyProjectile teamside` uses the existing resolver.
- Runtime projectiles and effect snapshots carry only normalized sides `1 | 2`.
- An explicit opposite-side projectile can contact its owner; same-owner
  clashes use deterministic pair order and require at least one opposite-side
  opt-in.
- Omitted, owner-equal, and invalid values remain inert.

## Verification

- `pnpm exec vitest run src/tests/RuntimeCompiler.test.ts src/tests/ProjectileSystem.test.ts src/tests/ProjectileCombatSystem.test.ts src/tests/MatchInteractionSystem.test.ts --testTimeout=30000`
  -> 4 files, 95/95 tests passed.
- `pnpm exec tsc -p tsconfig.json --noEmit` passed.
- `git diff --check` and staged diff hygiene passed.
- Browser/renderer smoke: N/A; this slice is compiler/runtime-only.

## Closeout

Report: `docs/reports/2026-07-16-projectile-teamside-ownership-v1-closeout.md`

Commit: `3769dd17 feat(runtime): model projectile teamside ownership`
