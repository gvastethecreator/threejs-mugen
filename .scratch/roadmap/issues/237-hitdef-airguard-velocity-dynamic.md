# Issue 237 — Direct HitDef airguard.velocity X/Y expressions

- Status: `active-research`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Resolve explicit dynamic and mixed `airguard.velocity` X/Y values for a fresh
root-owned direct HitDef and consume them in an accepted airborne guard.

## Source gate

M.U.G.E.N 1.1 documents X/Y expressions and defaults omission from effective
`air.velocity`: X multiplied by 1.5 and Y divided by 2. Pinned Ikemen GO
evaluates authored components in caller context and applies the resulting
vector to airborne guard contact.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html:280-281,1613-1619`
- pinned Ikemen `compiler_functions.go:2053-2055`
- pinned Ikemen `bytecode.go:7795-7801`
- pinned Ikemen `char.go:740-741,892-894,10980-10984,11198-11203`

## Acceptance fixture

- Compile two-component dynamic and mixed X/Y expressions.
- Resolve both components in the root caller context.
- Preserve the already verified fresh omitted default.
- Consume the vector in an accepted airborne guard and expose X/Y through
  GetHitVar plus physical guard velocity.
- Add one required imported airborne-guard trace.

## Claim ceiling

Do not claim Helper or ModifyHitDef ownership, partial one-component forms,
Ikemen Z, Projectile/ModifyProjectile, exact localcoord/facing transforms,
gravity/landing/tick order, corner push, teams, rollback, or full air-guard
physics.
