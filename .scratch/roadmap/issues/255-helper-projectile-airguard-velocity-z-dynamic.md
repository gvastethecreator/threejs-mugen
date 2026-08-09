# Issue 255 — Helper-authored Projectile airguard.velocity dynamic XYZ

- Status: `source-mapped`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Close the Helper-authored Projectile breadth left outside issue 254. A
Projectile created from a live Helper must resolve dynamic
`airguard.velocity` X/Y/Z in the original Helper caller context, retain the
pinned fresh defaults for omitted components, and expose the final vector on
an accepted airborne guard.

## Source gate

The pinned Ikemen path compiles up to three `airguard.velocity` float
expressions, evaluates them before Projectile ownership is materialized, and
finalizes missing fresh components from `air.velocity`, including the pinned
Z derivation. A Helper-created Projectile is stored under the root player
while retaining its Helper parent identity and later publishes all three
components through guard contact/GetHitVar.

Sources:

- Ikemen `149402f`: `compiler_functions.go:2007-2013`
- Ikemen `149402f`: `bytecode.go:7627-7642,7902-7915,8120-8133`
- Ikemen `149402f`: `char.go:713-717,802-861,7492-7505,10403-10407`
- M.U.G.E.N 1.1 Projectile docs state that Projectile inherits HitDef
  parameters; documented airguard defaults remain X/Y-only.

## Bounded acceptance proposal

- Helper-authored fresh Projectile resolves finite dynamic X/Y/Z values in
  the Helper caller context; omitted fresh components use the pinned
  `air.velocity` defaults.
- The effect remains root-owned with `parentId` identifying the Helper and
  proves spawn/active/remove lifecycle, effect-store payload, and target
  links.
- Accepted airborne Projectile guard exposes the final XYZ through physics
  and `GetHitVar(xvel/yvel/zvel)` evidence.
- Root-authored Projectile, live `ModifyProjectile`, dynamic `n` syntax,
  exact landing timing, nested/team ownership, rollback, and full
  M.U.G.E.N/Ikemen parity remain out of scope.

## Next bounded slice

Implement the Helper effect-spawn resolver and one required trace after the
root-owned T680 gate is integrated.
