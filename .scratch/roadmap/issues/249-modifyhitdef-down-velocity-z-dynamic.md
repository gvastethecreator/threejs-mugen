# Issue 249 — Live ModifyHitDef down.velocity Z expressions

- Status: `closed-bounded`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Extend the closed T674 live root-owned `ModifyHitDef down.velocity` seam with
an Ikemen-compatible dynamic Z component. A caller expression must replace Z
on the active normal HitDef while preserving the existing X/Y components.

## Source gate

The pinned Ikemen compiler accepts one-to-three `down.velocity` float
expressions and `ModifyHitDef` reuses the active HitDef evaluator without the
fresh default/finalization pass.

Source symbols:

- pinned Ikemen `compiler_functions.go:2009-2010,2286-2293`
- pinned Ikemen `bytecode.go:7725-7732,8339-8355`
- pinned Ikemen lying-hit consumer/GetHitVar velocity fields
- M.U.G.E.N 1.1 documents only X/Y; Z is therefore Ikemen-only here

## Acceptance contract

- A dynamic third component evaluates in the root caller context.
- A Z-only live mutation preserves active X/Y; omitted `down.velocity` remains
  a no-op; an authored X/Y pair continues to preserve Z.
- An accepted lying hit exposes the final X/Y/Z vector through physics and
  `GetHitVar` in one required imported trace.

## Evidence

- Runtime/compiler focused gate: `184/184`.
- Root `RedirectID` integration covers caller-context dynamic Z and X/Y
  preservation.
- Required trace:
  `synthetic-imported-modifyhitdef-dynamic-down-velocity-z-golden`.
- Aggregate trace gate: `748/748` artifacts (`714` required, `34` optional).
- Required trace checksum: `1e84d540`; final checksum: `2b8a4fd0`.
- Full suite/build/typecheck remain green at the integration boundary:
  `3733/3733` tests across `328` files and a `363`-module build.

## Claim ceiling

Do not claim M.U.G.E.N Z support, Helper-owned `ModifyHitDef`, fresh direct
inheritance, partial `n` syntax, Projectile/ModifyProjectile, exact landing or
Common1 timing, localcoord/facing equivalence, teams, rollback, or full
down-hit parity.
