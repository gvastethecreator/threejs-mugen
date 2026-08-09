# Issue 247 — Direct HitDef down.velocity expressions

- Status: `closed-bounded`
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
- pinned Ikemen `compiler_functions.go:2009-2010`
- pinned Ikemen `bytecode.go:7725-7732`
- pinned Ikemen `char.go:737-741,895-897`

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

## Closure evidence

- Fresh omission inherits air X/Y/Z; one-component X inherits Y/Z; a pair
  inherits Z; existing static triples remain intact.
- Root/Helper caller expressions resolve without leaking adversarial prior move
  data.
- Accepted lying hits with non-zero effective Y use the airborne timing/vector
  route and expose X/Y/Z through physical velocity and GetHitVar.
- Required trace checksum: `8043a64a`; final-state checksum: `39f71ee8`.
- Full suite: 3729/3729. Aggregate traces: 746/746, with 712 required and 34
  optional. Typecheck and the 363-module production build pass.
