# Issue 311 — live `ModifyHitDef guard.velocity` Y/Z extensions

Status: **closed-bounded** (T737, 2026-08-11)

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

## Evidence

- IR/runtime focused coverage: `RuntimeCompiler.test.ts` and
  `HitDefSystem.test.ts` pass `240/240`; `pnpm run typecheck` and
  `git diff --check` pass.
- Required trace:
  `synthetic-imported-modifyhitdef-dynamic-guard-velocity-yz.json` proves a
  root caller resolves `var(0..2) = -3,-4,6`, redirects the live mutation to an
  active target HitDef, accepts a real ground guard, and reaches the typed
  `GetHitVar(xvel/yvel/zvel)` branch with the target link and guard physics.
  Trace checksum is `a2eb52db`; final checksum is `f0fb19a8`.
- Aggregate `pnpm qa:trace` passes `824/824` artifacts (`790` required,
  `34` optional). No score movement: the exclusions above remain explicit.

## Next boundary

The next cursor is T738: Helper-owned live `ModifyHitDef guard.velocity` Y/Z
component replacement, with the same preservation contract and a separate
owner/parent evidence gate. It must not be conflated with fresh defaults,
air-guard vectors, or Projectile mutation.
