# Issue 313 — Helper-owned live `ModifyHitDef airguard.velocity` X/Y

Status: **superseded** (T739, 2026-08-11)

> This queue item duplicated the already closed T678 / issue 252 Helper-owned
> `ModifyHitDef airguard.velocity` X/Y implementation. No new implementation
> claim is attached to T739; the next distinct seam is tracked as T740 / issue
> 314.

## Objective

Extend the closed T738 Helper-owned live `ModifyHitDef guard.velocity` seam to
the airborne-guard X/Y pair, preserving the active HitDef's Z and omitted
components while retaining Helper/root/parent ownership evidence.

## Official basis

Pinned Ikemen-GO `149402f` evaluates `airguard.velocity` in the original
caller context and lets `ModifyHitDef` replace only authored components. M.U.G.E.N
1.1 documents the X/Y airborne-guard pair; dynamic Helper-owned mutation is an
Ikemen-only claim in this port.

## Bounded scope

- Helper caller with an active normal HitDef and airborne guarded target;
- static, mixed, and caller-context dynamic X/Y replacement;
- single X preservation of Y/Z and pair replacement with Z preserved;
- accepted airborne-guard `GetHitVar`/velocity evidence with ownership links.

## Excluded

Fresh defaults, dynamic Z, ground guard Y/Z, Projectile/ModifyProjectile,
Helper custom-state ownership beyond the active HitDef, exact landing/tick or
localcoord/facing parity, cornerpush, teams, rollback, and full guard physics
remain out of scope.
