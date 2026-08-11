# Issue 311 — live `ModifyHitDef guard.velocity` Y/Z extensions

Status: **queued** (T737, 2026-08-11)

## Objective

Extend the closed T662 root/RedirectID `guard.velocity` X seam with the
bounded Ikemen-only Y/Z components on a live `ModifyHitDef`, preserving every
omitted component of the active HitDef.

## Official basis

The pinned Ikemen-GO HitDef subcompiler accepts one-to-three `guard.velocity`
float components and the shared `ModifyHitDef` path evaluates authored
components in the original caller context. Ground guard contact publishes the
effective vector through the existing guard velocity/GetHitVar seam. M.U.G.E.N
1.1 documents the ground guard X parameter; Y/Z are therefore explicitly an
Ikemen extension and must not be claimed as M.U.G.E.N parity.

## Bounded scope

- root/RedirectID live `ModifyHitDef guard.velocity` Y and Z expressions;
- caller-context static, mixed, and dynamic component evaluation;
- single/pair/triple component preservation and omission no-op behavior;
- accepted ground-guard velocity/GetHitVar evidence.

## Excluded

Fresh default recalculation, `airguard.velocity`, Projectile/ModifyProjectile,
air guard timing, cornerpush, exact localcoord/facing or tick order, teams,
rollback, and full M.U.G.E.N/Ikemen guard physics parity remain out of scope.
