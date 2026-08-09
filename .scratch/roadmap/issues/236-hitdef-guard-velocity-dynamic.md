# Issue 236 — Direct HitDef guard.velocity X expressions

- Status: `active-research`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Resolve the M.U.G.E.N `guard.velocity` X expression for fresh direct HitDef
and live root-owned ModifyHitDef. Preserve the live vector when ModifyHitDef
omits the parameter.

## Source gate

M.U.G.E.N 1.1 defines ground-guard velocity as one numeric X expression and
defaults omission to `ground.velocity.x`. Pinned Ikemen GO evaluates authored
components in caller context; a fresh HitDef inherits X from the effective
ground vector, while ModifyHitDef changes only authored components.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html:280-281,1609-1612`
- pinned Ikemen `compiler_functions.go:2126-2128,2286-2293`
- pinned Ikemen `bytecode.go:7817-7823,8332-8355`
- pinned Ikemen `char.go:737-741,890-891,10977-10991,11198-11200`

## Acceptance fixture

- Compile literal and dynamic direct HitDef/ModifyHitDef X expressions.
- Resolve a fresh root caller expression and consume it in an accepted ground
  guard plus `GetHitVar(xvel)`.
- Default fresh omission from effective `ground.velocity.x`.
- Change only live guard X through ModifyHitDef and preserve Y/Z and full
  omission.
- Add required imported evidence for the fresh and live-mutation routes.

## Claim ceiling

Limit the claim to root-owned X. Do not claim Helper/redirect ownership,
Ikemen Y/Z extensions, Projectile/ModifyProjectile, `airguard.velocity`, exact
localcoord/sign transforms, corner push, rollback, or full guard physics.
