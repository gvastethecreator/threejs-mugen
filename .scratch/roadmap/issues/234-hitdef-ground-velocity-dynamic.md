# Issue 234 — Dynamic direct HitDef ground.velocity

- Status: `closed-bounded`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Resolve direct HitDef `ground.velocity` X/Y in root and Helper caller contexts.
Preserve partial live ModifyHitDef replacement. Feed accepted grounded hit
velocity and GetHitVar readback.

## Source gate

M.U.G.E.N 1.1 defines an X/Y float pair. The Y value is optional. Pinned
Ikemen GO evaluates each component in caller context. ModifyHitDef uses the
same live HitDef path.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html:1604-1608`
- pinned Ikemen `compiler_functions.go` `ground.velocity`
- pinned Ikemen `bytecode.go` `hitDef_ground_velocity_x/y/z`
- pinned Ikemen accepted grounded-hit path in `char.go`

## Acceptance fixture

- Compile one/two-component literal and dynamic values. Reject malformed input.
- Resolve finite float components in root and Helper caller contexts.
- Use Y zero for an explicit fresh one-component value.
- Preserve omitted live ModifyHitDef components and the existing Z value.
- Feed accepted grounded hit velocity and GetHitVar X/Y readback.
- Add one required trace with `var(0)=4`, `var(1)=-2`, and target 77.

## Evidence

- Focused compiler, HitDef, and direct-contact suites pass 235/235.
- The required imported trace passes with checksum `9c99ac6e` and final
  checksum `0e09cb11`.
- Aggregate traces pass 732/732 with 698 required and 34 optional.
- Typecheck, the 363-module build, runtime boundaries, and redirect boundaries
  pass.
- After migrating the retired roster expectations to Rocco and Nadia, the full
  suite passes 3690/3690.

## Claim ceiling

Do not claim the fully omitted fresh default, `n` syntax, dynamic Z, exact
localcoord or facing transforms, launch timing, friction, corner push,
Projectile or ModifyProjectile, teams, rollback, or full velocity parity.
