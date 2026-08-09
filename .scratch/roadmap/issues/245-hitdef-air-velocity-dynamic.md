# Issue 245 — Direct HitDef air.velocity expressions

- Status: `active-research`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Resolve direct-HitDef `air.velocity` X/Y expressions in the caller context and
feed the existing accepted airborne-hit consumer.

## Source gate

M.U.G.E.N 1.1 documents X/Y `air.velocity` with zero defaults. Pinned Ikemen
compiles float expressions, evaluates each authored component in the caller,
applies the vector to airborne receivers, and publishes it through GetHitVar.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html` HitDef `air.velocity`
- pinned Ikemen `compiler_functions.go:2049-2051`
- pinned Ikemen `bytecode.go:7787-7794`
- pinned Ikemen `char.go:737-741,11027-11029,11192-11194`

## Acceptance fixture

- Root and Helper direct HitDef resolve one/two-component X/Y expressions in
  caller context; a single component uses Y zero.
- Fresh expression resolution does not inherit adversarial prior metadata.
- Static pairs/triples and complete omission retain their current behavior.
- Accepted airborne hit exposes the resolved X/Y through physical velocity and
  GetHitVar in one required imported trace.

## Claim ceiling

Limit support to X/Y fresh direct HitDef root/Helper. Do not claim dynamic Z,
`n` syntax, live ModifyHitDef, Projectile/ModifyProjectile, lying targets,
exact localcoord/facing or landing timing, teams, rollback, or full air-hit
physics.
