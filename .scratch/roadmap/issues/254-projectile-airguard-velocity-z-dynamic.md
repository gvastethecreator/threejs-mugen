# Issue 254 — Projectile airguard.velocity dynamic Z

- Status: `source-mapped`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Source gate

The pinned Ikemen Projectile path reuses HitDef parsing/evaluation for
`airguard.velocity`, accepts up to three float expressions, finalizes missing
components from `air.velocity`, and publishes all three components on accepted
airborne guard contact.

Sources:

- Ikemen `149402f`: `compiler_functions.go:2007-2013`
- Ikemen `149402f`: `bytecode.go:7627-7642,7902-7915,8120-8133`
- Ikemen `149402f`: `char.go:713-717,802-861,10403-10407`
- M.U.G.E.N 1.1 Projectile docs state that Projectile inherits HitDef
  parameters; its documented airguard defaults remain X/Y-only.

## Bounded acceptance proposal

- Root-owned fresh Projectile resolves finite dynamic airguard X/Y/Z in the
  original caller context, with missing fresh components using the pinned
  defaults.
- Accepted airborne Projectile guard exposes the final XYZ through lifecycle,
  physics, and `GetHitVar` evidence.
- Helper-owned Projectile, ModifyProjectile, dynamic `n` syntax, exact landing
  timing, and rollback remain out of scope until separately gated.

