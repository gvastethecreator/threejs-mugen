# Issue 248 — Live ModifyHitDef down.velocity expressions

- Status: `active-research`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Resolve live root-owned `ModifyHitDef down.velocity` X/Y expressions in caller
context while preserving omitted active components.

## Source gate

Pinned Ikemen compiles `down.velocity` float expressions through the shared
HitDef parameter block. ModifyHitDef applies only authored components to the
active HitDef without the fresh inheritance/finalization pass.

Source symbols:

- M.U.G.E.N 1.1 HitDef `down.velocity` documentation
- pinned Ikemen `compiler_functions.go:2009-2010,2286-2293`
- pinned Ikemen `bytecode.go:7725-7732,8339-8355`
- pinned Ikemen lying-hit velocity/GetHitVar consumers

## Acceptance fixture

- Omission preserves the live X/Y/Z vector.
- One component replaces X and preserves Y/Z; a pair replaces X/Y and
  preserves Z; existing static Z remains compatible.
- Redirected root-owned mutation evaluates expressions in caller context.
- Accepted lying hit exposes the final vector and matching timing route through
  physical velocity/GetHitVar in one required imported trace.

## Claim ceiling

Describe ModifyHitDef as pinned-Ikemen compatibility. Do not claim Helper-owned
ModifyHitDef, fresh inheritance, dynamic Z, `n` syntax,
Projectile/ModifyProjectile, exact lie-down/Common1 or landing timing,
localcoord/facing equivalence, teams, rollback, or full down-hit physics.
