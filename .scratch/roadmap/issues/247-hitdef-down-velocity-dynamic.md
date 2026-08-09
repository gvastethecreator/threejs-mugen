# Issue 247 — Direct HitDef down.velocity expressions

- Status: `active-research`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Resolve fresh direct-HitDef `down.velocity` X/Y expressions in root/Helper
caller context and inherit missing components from effective `air.velocity`.

## Source gate

M.U.G.E.N 1.1 documents `down.velocity` for lying hits and says omission
inherits `air.velocity`. Pinned Ikemen evaluates authored float components and
finalizes every missing fresh component from the air vector.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html` HitDef `down.velocity`
- pinned Ikemen `compiler_functions.go:1967-1969`
- pinned Ikemen `bytecode.go:7565-7572`
- pinned Ikemen `char.go:713-715,829-833,862-864`

## Acceptance fixture

- Omission inherits effective air X/Y/Z.
- One-component X inherits Y/Z; a pair inherits Z; static triples win.
- Root/Helper caller expressions do not inherit adversarial prior move data.
- Accepted lying hit exposes the effective vector and matching hit-time branch
  through physical velocity and GetHitVar in one required imported trace.

## Claim ceiling

Limit support to fresh direct HitDef root/Helper X/Y expressions and component
inheritance. Do not claim live ModifyHitDef, dynamic Z, `n` syntax,
Projectile/ModifyProjectile, exact lie-down/Common1 or landing timing,
localcoord/facing equivalence, teams, rollback, or full down-hit physics.
