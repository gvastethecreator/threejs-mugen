# T739 research — Helper-owned live `ModifyHitDef airguard.velocity` X/Y

Date: 2026-08-11  
Issue: [313](../issues/313-helper-modifyhitdef-airguard-velocity-xy.md)  
Status: queued

## Selection rationale

T738 closes the Helper-owned ground-guard Y/Z mutation. The smallest adjacent
frontier is the existing airborne-guard X/Y consumer already covered by the
root/RedirectID slices, with the same caller-context and component-preservation
rules. This keeps dynamic Z and fresh-default derivation out of the next cut.

## Pinned contract

Ikemen-GO `149402f` compiles up to three `airguard.velocity` float components and
reuses `HitDef.runSub` for `ModifyHitDef`; omitted components remain live. The
M.U.G.E.N 1.1 documentation covers the X/Y pair, while Helper-owned live
mutation is tracked as Ikemen-only.

## Planned evidence

Use one required Helper trace with root/parent ownership, VarSet + Helper
HitDef + ModifyHitDef, an airborne guard target, target link, `HitVelSet`/`VelAdd`,
and `GetHitVar(xvel/yvel)` evidence. Keep Z seeded and unchanged. Focused
runtime/compiler coverage must prove omit, single-X, pair, and malformed input.

## Deferred boundaries

Fresh defaults, dynamic Z, ground guard Y/Z (closed in T738), Projectiles,
ModifyProjectile, exact landing/tick/localcoord/facing behavior, teams, rollback,
and full M.U.G.E.N/Ikemen guard physics remain blocked.
