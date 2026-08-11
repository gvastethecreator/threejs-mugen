# T738 research — Helper-owned live `ModifyHitDef guard.velocity` Y/Z

Date: 2026-08-11  
Issue: [312](../issues/312-helper-modifyhitdef-guard-velocity-yz.md)  
Status: closed-bounded

## Official contract

Pinned Ikemen-GO `149402f` compiles `guard.velocity` as up to three float
components, evaluates them in the original caller context, and reuses the
same HitDef subroutine for `ModifyHitDef`. A live modification replaces only
authored components; omitted X/Y/Z components remain on the active HitDef.
M.U.G.E.N 1.1 documents the ground-guard X component; Y/Z and Helper-owned
live mutation remain explicitly outside the M.U.G.E.N claim.

## Implemented seam

The shared Helper dispatch now resolves static, mixed, and `var(0..2)` values
through `resolveRuntimeHelperFloatPairParam`/`resolveRuntimeHelperFloatScalarParam`.
`HitDefSystem.modify` applies the resolved components to `guardPush`,
`guardVelocityY/Z`, and `hitVelocities.guard`, preserving omitted siblings and
the authored Z channel. The accepted ground-guard path exposes the resulting
X/Y/Z values through `GetHitVar` and the existing guard-velocity metadata.

## Evidence

- Helper unit regression: `Helper-owned ModifyHitDef guard.velocity Y/Z`.
- Required trace: `synthetic-imported-helper-modifyhitdef-dynamic-guard-velocity-yz`.
- Trace checksum: `da73f66a`.
- Final checksum: `4231487d`.
- Trace proves Helper/root/parent ownership, VarSet + Helper HitDef + live
  ModifyHitDef, target link, accepted grounded guard, and `GetHitVar` values
  `xvel=3`, `yvel=-4`, `zvel=6` after runtime-facing normalization.
- `pnpm qa:trace`: 825/825 artifacts passed (791 required, 34 optional).

## Boundaries

Fresh defaults, air guard, Projectile/ModifyProjectile, dynamic Z in other
controllers, Helper custom-state ownership beyond this active HitDef,
cornerpush, exact tick/localcoord/facing parity, teams, rollback, and full
M.U.G.E.N/Ikemen guard-physics parity remain deferred.
