# Issue 254 — Projectile airguard.velocity dynamic Z

- Status: `closed-bounded`
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

## Closure evidence

- Compiler/Projectile focused coverage: `181/181` tests.
- Required trace:
  `synthetic-imported-projectile-dynamic-airguard-velocity`.
- Required trace checksum: `8cae22a1`; final checksum: `32fb962c`.
- Aggregate trace gate passes `753/753` artifacts (`719` required,
  `34` optional); the full suite passes `3744/3744` tests across `328` files;
  typecheck and the `363`-module build pass.

## Claim ceiling

Do not claim Helper-authored Projectile caller/parent breadth, live
ModifyProjectile dynamic-Z support, dynamic `n` syntax, exact landing/gravity
timing, localcoord or facing equivalence, teams, rollback, or full engine
parity.

## Next bounded slice

T681 closed the Helper-authored/root-owned fresh Projectile
`airguard.velocity` dynamic XYZ and parent/lifecycle evidence. T682 closed the
fresh Projectile `air.velocity` dynamic XYZ source gate. T683 is now
source-mapped for fresh Projectile `down.velocity` dynamic XYZ with pinned
air-vector inheritance.
