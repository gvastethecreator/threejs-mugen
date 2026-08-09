# Issue 73 — Ikemen `GetHitVar` HitDef velocity vectors

Status: closed-bounded (2026-08-01)

## Scope

Carry the last direct HitDef and player-owned Projectile velocity vectors into
the runtime hit-variable record and expose the Ikemen aliases:

- `ground.velocity.x/y/z`
- `air.velocity.x/y/z`
- `down.velocity.x/y/z`
- `guard.velocity.x/y/z`
- `airguard.velocity.x/y/z`

Missing vector families/components read as zero. The slice does not add string
attribute readback, dynamic vector expressions, Z physics, or full helper/team
inheritance.

## Authority

- [Ikemen-GO changed triggers — GetHitVar velocity families](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#GetHitVar)
- [Ikemen-GO changed state-controller reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29#hitdef-parameters)

## Implementation

- `RuntimeHitVelocityMetadata` records the five vector families on
  `RuntimeGetHitVars`.
- Direct HitDef and Projectile creation preserve parsed/effective vectors;
  `RuntimeHitVarSystem` resolves dotted aliases with zero fallback.
- Existing bounded static `ModifyHitDef` Z mutations update the corresponding
  metadata component before the next contact.

## Evidence

- Focused: `RuntimeExpressionContextSystem`, `DirectCombatSystem`,
  `ProjectileCombatSystem`, and `importedFighter` tests pass (4 files/133
  tests).
- Full suite is 324 files/3324 tests; typecheck, build, boundaries, trace,
  hygiene, and diff checks are recorded in the roadmap after the final gate run.

## Claim ceiling

This is metadata/readback only. It does not claim exact Ikemen default-value
semantics for omitted vectors, dynamic vector expression parity, Common1
velocity/friction/Z physics, or complete M.U.G.E.N/Ikemen trigger coverage.
