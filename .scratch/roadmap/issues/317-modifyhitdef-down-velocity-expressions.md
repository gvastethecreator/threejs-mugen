# Issue 317 — Live `ModifyHitDef down.velocity` X/Y expressions

Status: superseded (duplicate of closed T728 / issue 302, 2026-08-11)

## Objective

Extend the next bounded Ikemen-only live `ModifyHitDef` seam to `down.velocity`
X/Y for the root/RedirectID and Helper caller paths. A single authored value
changes X while preserving the live Y/Z components; a pair changes X/Y while
preserving Z; omission remains a no-op. Fresh direct `HitDef down.velocity`
defaults and the existing lying-hit consumer are already covered by T673 and
are not reopened here.

## Source authority

- Ikemen GO pin `149402f`: `compiler_functions.go` compiles
  `down.velocity` as one-to-three float expressions; `bytecode.go` evaluates
  only authored components against the caller and `ModifyHitDef` reuses the
  active HitDef subroutine without fresh defaulting; `char.go` carries the
  resulting vector into lying-hit metadata and contact physics.
- M.U.G.E.N 1.1 documents `down.velocity=x,y` and fresh inheritance from
  `air.velocity`; the live `ModifyHitDef` claim is Ikemen-only.

## Historical result

This issue was selected again after T742, but the requested seam was already
closed-bounded by T728 / issue 302. The implementation and required traces are
tracked there; this file remains only as an audit trail so the duplicate is not
reopened.

## Original planned acceptance

- Static, mixed, and caller-context dynamic single/pair X/Y values compile and
  resolve finite components; malformed or unsupported triples fail closed.
- A live RedirectID `ModifyHitDef` mutates only authored components and keeps
  the active Z/omitted siblings; omission leaves the complete live vector
  unchanged.
- A required lying-contact trace proves `VarSet -> HitDef -> ModifyHitDef`,
  target link, `GetHitVar(xvel/yvel/zvel)`, and the accepted down-hit physical
  route for root ownership. Focused Helper coverage proves the caller resolver.

## Explicit exclusions

Fresh default derivation, dynamic Z/`n` syntax, Projectile/ModifyProjectile,
guard/air velocity, exact lie-down tables and landing timing, localcoord/facing,
teams, rollback, and full M.U.G.E.N/Ikemen parity remain outside T743.
