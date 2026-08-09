# Issue 252 — Helper-owned ModifyHitDef airguard.velocity

- Status: `queued`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Extend the closed T677 Helper-owned live `ModifyHitDef air.velocity` seam to
the airborne-guard vector. A Helper caller must be able to replace the active
HitDef `airguard.velocity` X/Y components in its own caller context while
preserving omitted live components and Helper/root/target ownership.

## Source gate

The pinned Ikemen runtime evaluates live `ModifyHitDef airguard.velocity`
through the active HitDef without fresh inheritance/finalization. A
one-component mutation replaces X, a pair replaces X/Y, and omitted
components remain live. M.U.G.E.N 1.1 documents the base `airguard.velocity`
field, but not live `ModifyHitDef`; this slice is therefore Ikemen-only for
the live Helper path.

Sources to pin before implementation:

- Ikemen `149402f`: `compiler_functions.go:2053-2055,2286-2293`
- Ikemen `149402f`: `bytecode.go:7795-7801,8332-8355`
- Ikemen airborne-guard velocity/GetHitVar consumers
- M.U.G.E.N 1.1 `sctrl.hitdef.html` `airguard.velocity` documentation

## Acceptance contract

- Helper-authored `ModifyHitDef` resolves dynamic X/Y in Helper caller context.
- One component replaces X and preserves Y/Z; two replace X/Y and preserve Z;
  omission is a no-op.
- An accepted airborne guard exposes the final vector through physics and
  `GetHitVar`, with Helper/root/target ownership recorded in one required trace.

## Claim ceiling

Do not claim M.U.G.E.N live `ModifyHitDef`, fresh inheritance, dynamic Z,
partial `n` syntax, Projectile or ModifyProjectile, exact landing/Common1
timing, localcoord/facing equivalence, teams, rollback, or full Helper parity.
