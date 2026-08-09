# Issue 175 — Ikemen ModifyProjectile ground slidetime

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Port ModifyProjectile `ground.slidetime` mutation through unguarded Projectile
contact and the existing `GetHitVar(slidetime)` read boundary.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` evaluates one integer expression
and replaces the selected live Projectile HitDef `ground_slidetime`. Unguarded
contact copies that value into the defender's get-hit slide-time metadata;
guard contact keeps `guard.slidetime` separate.

## Acceptance fixture

- Compile a static integer value.
- Resolve bounded dynamic root/helper values.
- Mutate only selected live Projectiles.
- Prove later unguarded contact exposes the changed value through
  `GetHitVar(slidetime)` without changing the guard route.

## Claim ceiling

Do not claim complete Common1 sliding choreography, exact tick order,
rollback/netplay serialization, or full ModifyProjectile parity.

## Verification

- Five focused files: 586 passed and 19 inherited failures.
- Full suite: 3418 passed and 58 inherited failures from 3476 tests.
- `pnpm typecheck` passed.
- `pnpm build` passed with 359 modules.
- `pnpm qa:trace` passed 686/686 artifacts.
- Boundary and redirect-boundary checks passed.
- `git diff --check` passed with existing CRLF warnings only.
