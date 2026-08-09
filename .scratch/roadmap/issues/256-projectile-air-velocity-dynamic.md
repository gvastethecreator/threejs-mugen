# Issue 256 — fresh Projectile air.velocity dynamic XYZ

- Status: `source-mapped`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Close the next fresh-Projectile gap after T680/T681: resolve authored
`air.velocity` X/Y/Z expressions when a Projectile is created by a root actor
or a Helper, then expose the vector through accepted airborne hit physics and
`GetHitVar`.

## Source gate

The pinned Ikemen path compiles up to three `air.velocity` float expressions,
evaluates them in the original caller before Projectile materialization, and
stores the resulting vector on the fresh HitDef. M.U.G.E.N 1.1 documents the
X/Y form and zero defaults; the pinned Ikemen extension carries Z through the
same vector/contact path.

Sources:

- Ikemen `149402f`: `compiler_functions.go:2049-2051`
- Ikemen `149402f`: `bytecode.go:7787-7794,7902-7915,8120-8133`
- Ikemen `149402f`: `char.go:737-741,11027-11029,11192-11194`
- M.U.G.E.N 1.1: `sctrl.hitdef.html` `air.velocity` X/Y and zero defaults;
  Projectile inherits HitDef parameters.

## Bounded acceptance proposal

- Root-authored and Helper-authored fresh Projectiles preserve static
  `air.velocity` behavior and additionally resolve finite dynamic/mixed X/Y/Z
  expressions in caller context.
- A single dynamic component uses the official fresh zero default for omitted
  siblings; a two-component form defaults only Z to zero; a full triple wins
  component-wise.
- Accepted airborne hits expose the resolved XYZ through Projectile physics,
  contact metadata, and `GetHitVar(xvel/yvel/zvel)` evidence.
- Fresh Projectile lifecycle, root/Helper ownership, parent links, target
  memory, and removal behavior stay on the existing seams.

## Explicit exclusions

Live `ModifyProjectile` mutation, dynamic `n` syntax, airguard derivation,
lying/ground selection, exact landing/tick order, localcoord/facing edge cases,
nested/team topology, rollback, and full M.U.G.E.N/Ikemen Projectile parity.

## Next implementation step

Add typed Projectile `air.velocity` expression fields and caller-context
resolvers for root and Helper spawn, then add the smallest root/Helper tests
and one required airborne-hit trace.
