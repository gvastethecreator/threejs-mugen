# Issue 251 — Helper-owned ModifyHitDef air.velocity

- Status: `queued`
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
