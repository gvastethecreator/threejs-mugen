# Issue 251 — Helper-owned ModifyHitDef air.velocity

- Status: `closed-bounded`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Extend the closed T676 Helper-owned `ModifyHitDef down.velocity` seam to the
live airborne-hit vector. A Helper caller must be able to replace the active
HitDef `air.velocity` X/Y components in its own caller context while
preserving omitted live components and the existing Helper/root ownership.

## Source gate

The pinned Ikemen runtime evaluates live `ModifyHitDef air.velocity` through
the active HitDef without fresh inheritance/finalization. A one-component
mutation replaces X, a pair replaces X/Y, and omitted components remain live.

Sources to pin before implementation:

- Ikemen `149402f`: `compiler_functions.go:2007-2009,2242-2249`
- Ikemen `149402f`: `bytecode.go:7627-7634,8164-8181`
- Ikemen airborne-hit velocity/GetHitVar consumers
- M.U.G.E.N 1.1 documents the base `air.velocity` fields, but not live
  `ModifyHitDef`; the live Helper path is therefore Ikemen-only

## Acceptance contract

- Helper-authored `ModifyHitDef` resolves dynamic X/Y in Helper caller context.
- One component replaces X and preserves Y/Z; two replace X/Y and preserve Z;
  omission is a no-op.
- An accepted airborne hit exposes the final vector through physics and
  `GetHitVar`, with Helper/root/target ownership recorded in one required
  trace.

## Claim ceiling

Do not claim M.U.G.E.N live `ModifyHitDef`, fresh inheritance, dynamic Z,
partial `n` syntax, Projectile or ModifyProjectile, exact landing/Common1
timing, localcoord/facing equivalence, teams, rollback, or full Helper parity.

## Closure evidence

- Helper-owned runtime coverage proves caller-local dynamic X/Y resolution;
  one-component mutation replaces X while preserving Y/Z, a pair replaces
  X/Y while preserving Z, and omission is a no-op.
- Accepted airborne contact exposes `GetHitVar(xvel/yvel/zvel)=7/-5/4` and
  applies the same vector through the physical HitVelSet path while preserving
  Helper/root/parent target ownership.
- Required trace:
  `synthetic-imported-helper-modifyhitdef-dynamic-air-velocity`.
- Required trace checksum: `6e91818d`; final checksum: `93efa92a`.
- Aggregate trace gate passes `750/750` artifacts (`716` required,
  `34` optional); the full suite passes `3737/3737` tests across `328` files,
  typecheck passes, and the `363`-module build passes.

## Next bounded slice

T678 closes Helper-owned live `ModifyHitDef airguard.velocity` X/Y
component-preserving mutation; issue 252 records its evidence. T679 is
source-mapped but unclaimed.
