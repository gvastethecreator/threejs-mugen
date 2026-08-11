# Issue 312 — Helper-owned live `ModifyHitDef guard.velocity` Y/Z

Status: **queued** (T738, 2026-08-11)

## Objective

Extend the closed T737 root/RedirectID component-wise `guard.velocity` seam to
Helper-authored `ModifyHitDef`, preserving the active target HitDef's omitted
components while retaining Helper/root/parent ownership evidence.

## Official basis

The pinned Ikemen-GO `ModifyHitDef` path evaluates one-to-three float
`guard.velocity` components in the original caller context and mutates the
active HitDef. M.U.G.E.N 1.1 documents only the ground-guard X component;
Y/Z and Helper-owned mutation are explicitly outside the M.U.G.E.N claim.

## Bounded scope

- Helper caller with an active normal HitDef and root/parent target memory;
- static, mixed, and dynamic X/Y/Z component evaluation;
- single/pair/triple replacement, omitted-component preservation, and no-op
  omission;
- accepted ground-guard `GetHitVar`/velocity evidence with ownership links.

## Excluded

Fresh defaults, air guard, Projectile/ModifyProjectile, Helper custom-state
ownership beyond the active HitDef, cornerpush, exact tick/localcoord/facing
parity, teams, rollback, and full M.U.G.E.N/Ikemen guard physics remain out of
scope.
