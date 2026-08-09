# Issue 74 — Ikemen `GetHitVar(hitdamage|guarddamage)`

Status: closed-bounded (2026-08-01)

## Scope

Expose the two authored `HitDef damage` components through the shared runtime
read model:

- `GetHitVar(hitdamage)` — first damage component;
- `GetHitVar(guarddamage)` — second damage component.

The current direct HitDef and player-owned Projectile paths preserve these
values alongside the effective contact damage. This slice does not add
`hitpower`, `guardpower`, resource scaling, string attributes, or KO/score
semantics.

## Authority

- [Ikemen-GO changed triggers — GetHitVar damage values](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#GetHitVar)
- [Elecbyte M.U.G.E.N trigger reference](https://www.elecbyte.com/mugendocs-11b1/trigger.html)

## Evidence

Focused RuntimeExpressionContext, DirectCombatSystem and ProjectileCombatSystem
coverage passes 114 tests. Final verification passes 324 files/3324 tests,
typecheck, build, boundaries, `qa:trace` 682/682, asset hygiene and diff
hygiene. Browser smoke is N/A because no visible surface changed.

## Claim ceiling

Readback only. Exact Ikemen resource gains, scaling order, KO/guard semantics,
helper/team ownership and the remaining changed GetHitVar families remain
unsupported.
