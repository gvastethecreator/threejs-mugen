# 67 - T482 Ikemen-GO ModifyHitDef velocity Z mutation

Status: closed-bounded
Labels: ikemen, runtime, combat, depth, modifyhitdef
Lane: runtime / combat
Priority: P1
Depends on: T481 HitDef velocity Z propagation

## Objective

Preserve the authored third component of `ground.velocity`, `air.velocity`,
`down.velocity`, `guard.velocity` and `airguard.velocity` when a static
`ModifyHitDef` updates an active normal HitDef. The mutation is applied to the
same `DemoMove` consumed by direct/projectile contact; omitted Z stays unchanged.

## Source contract

Ikemen-GO documents `ModifyHitDef` as updating the active HitDef with the same
optional parameters as `HitDef`. Its changed HitDef reference defines the third
component of the five velocity vectors as Z velocity.

Source: [Ikemen-GO changed state-controller reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29#hitdef-parameters)

## Scope

- Compile static vector parameters and retain only their authored third value.
- Apply Z mutation to active normal HitDef metadata, including `down.velocity`
  alongside its existing X/Y mutation.
- Preserve omitted-Z/no-active-HitDef rejection and direct/projectile T481
  selection semantics.

## Claim ceiling

This slice does not claim dynamic ModifyHitDef expressions, helper/team ownership
breadth, Common1 Z acceleration/friction, or complete Ikemen/M.U.G.E.N depth
physics.

## Evidence

- Focused compiler/HitDef mutation coverage: 2 files / 89 tests passed.
- Final suite: 324 files / 3317 tests passed.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, `pnpm qa:trace`
  682/682 artifacts and `git diff --check` passed.
- Score movement: none.
