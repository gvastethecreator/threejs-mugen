# Issue 257 — fresh Projectile down.velocity dynamic XYZ

- Status: `source-mapped`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Close the next fresh-Projectile vector gap after T682: resolve authored
`down.velocity` X/Y/Z expressions when a Projectile is created by a root actor
or a Helper, then expose the result through accepted lying-hit physics and
`GetHitVar`.

## Source gate

The pinned Ikemen path compiles up to three `down.velocity` float expressions,
evaluates authored components in the caller, and finalizes omitted fresh
components from the effective `air.velocity`. M.U.G.E.N 1.1 documents the
X/Y form and the same air-velocity inheritance rule; the pinned Ikemen path
also carries Z through the Projectile HitDef/contact vector.

Sources:

- Ikemen `149402f`: `compiler_functions.go:1967-1969`
- Ikemen `149402f`: `bytecode.go:7565-7572,7902-7915,8120-8133`
- Ikemen `149402f`: `char.go:713-715,829-833,862-864`
- M.U.G.E.N 1.1: `sctrl.hitdef.html` `down.velocity` X/Y and inheritance from
  `air.velocity`; Projectile inherits HitDef parameters.

## Bounded acceptance proposal

- Root-authored and Helper-authored fresh Projectiles preserve static
  `down.velocity` behavior and additionally resolve finite dynamic/mixed X/Y/Z
  expressions in caller context.
- A single dynamic component replaces X and inherits Y/Z from effective
  `air.velocity`; a two-component form replaces X/Y and inherits Z; a full
  triple wins component-wise.
- Accepted lying hits expose the resolved XYZ through Projectile physics,
  contact metadata, and `GetHitVar(xvel/yvel/zvel)` evidence.
- Fresh Projectile lifecycle, root/Helper ownership, parent links, target
  memory, and existing removal behavior remain on current seams.

## Explicit exclusions

Live `ModifyProjectile` mutation, dynamic `n` syntax, air/airguard derivation,
ground/air selection, exact landing/tick order, localcoord/facing edge cases,
nested/team topology, rollback, and full M.U.G.E.N/Ikemen Projectile parity.

## Next implementation step

Add typed Projectile `down.velocity` expression fields and caller-context
resolvers for root and Helper fresh spawn, reuse the pinned air-vector
inheritance helper, then add focused compiler/runtime tests and one required
root/Helper lying-hit trace.
