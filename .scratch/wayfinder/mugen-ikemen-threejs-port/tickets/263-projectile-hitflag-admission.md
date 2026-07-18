# Ticket 263: explicit projectile HitFlag admission

- Status: planned
- Date: 2026-07-18
- Scope: explicit projectile HitDef `hitflag` transport, mutation, and bounded
  target admission
- Depends on: T260/T261/T262 shared direct HitFlag admission, projectile
  compiler/runtime ownership, projectile combat, and effect snapshots
- Research: [`docs/research/2026-07-18-projectile-hitflag-admission.md`](../../../../docs/research/2026-07-18-projectile-hitflag-admission.md)
- Source contract: pinned IKEMEN GO commit `044da72008b8ba13caf7b0f820526ce16e955fb3`

## Question

Can explicit projectile `HitDef.hitflag` values use the existing shared
admission predicate without changing omitted/default projectile behavior or
claiming full projectile timing parity?

## Bounded contract

- Carry an authored `hitflag` from `Projectile` controller IR into the live
  `RuntimeProjectile` and its effect snapshot when present.
- Carry a static authored `hitflag` from `ModifyProjectile` into the typed
  operation and apply it to matching active projectiles.
- Apply the shared explicit HitFlag admission predicate to projectile/player
  contact before HitBy/NotHitBy and override resolution.
- Use the owning root runtime as the attacker-side `NoFallHitFlag` source,
  preserving helper-owned projectile root attribution.
- Keep omitted projectile hitflags undefined; default `MAF` inference is a
  separate contract and remains open.

## Out of scope

Dynamic/string expression resolution for `ModifyProjectile.hitflag`, reversal
admission, projectile clash priority parity, exact `acttmp`/`hittmp` timing,
projectile pause/contact ordering, full default inference, custom-state
ownership breadth, ZSS/Lua, rollback/netplay, and full MUGEN/IKEMEN parity.

## Acceptance evidence

- Compiler tests cover explicit `Projectile` and `ModifyProjectile` hitflags.
- Projectile system tests cover storage, snapshot visibility, and mutation.
- Projectile combat tests cover explicit state/fall/minus/plus rejection,
  allowed contact, omitted compatibility, and helper-root ownership through
  the shared predicate.
- Focused runtime tests, TypeScript 7, build, repository boundaries, trace QA,
  and diff hygiene are grouped at the next large checkpoint.
- Browser smoke is N/A unless the changed effect metadata reaches a visible
  surface.

## Claim ceiling

This ticket closes only explicit projectile HitFlag transport and bounded
player-contact admission. It does not close defaults, reversals, exact
projectile timing, dynamic string expressions, or full compatibility.
