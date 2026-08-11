# Issue 306 — `ModifyHitDef` `guard.sparkno` expressions

Status: **queued** (T732, 2026-08-11)

## Objective

Close the Ikemen-only live replacement of the guarded hit-spark identity
(`guard.sparkno`) through root/RedirectID and Helper caller paths, preserving
the active identity when the controller omits the field or its expression is
not resolvable.

## Official basis

The pinned Ikemen-GO `149402f` compiler reuses the HitDef sub-parameter for
`guard.sparkno` (`compiler_functions.go:1948-1951`). The runtime evaluates the
caller expression and stores both the FightFX prefix and numeric spark identity
(`bytecode.go:7670-7673`); accepted guard contact consumes those fields when
creating the guard spark (`char.go:11446-11450`). M.U.G.E.N 1.1 documents the
fresh HitDef field, but not live `ModifyHitDef` mutation, so the live claim is
Ikemen-only.

## Bounded scope

- static and dynamic `guard.sparkno` on direct `ModifyHitDef`;
- root/RedirectID and Helper caller-context evaluation;
- omission/unresolved preservation of the active spark identity;
- accepted guard-effect event evidence for prefix, numeric identity and angle.

## Excluded

Fresh defaults, `sparkangle`, `sparkxy`, scale, palette, sound, hit-spark
identity, Projectiles/ModifyProjectile, exact FightFX/common lookup, renderer
timing, localcoord, teams, rollback and full M.U.G.E.N/Ikemen parity remain
out of scope.

## Evidence plan

Extend compiler/runtime/Helper presentation tests and add one required trace
with `VarSet` + `HitDef` + `ModifyHitDef`, a real guard contact and preserved
angle/offset. Promote only when the guard event proves the replacement without
entering the hit route.
