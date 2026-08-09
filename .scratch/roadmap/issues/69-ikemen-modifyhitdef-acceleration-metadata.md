# 69 - T484 Ikemen-GO ModifyHitDef acceleration metadata

Status: closed-bounded
Labels: ikemen, runtime, combat, gethitvar, modifyhitdef
Lane: runtime / combat
Priority: P1
Depends on: T483 HitDef acceleration metadata

## Objective

Allow static `ModifyHitDef` to update an active normal HitDef's
`xaccel`/`yaccel`/`zaccel` metadata, preserving the same direct/projectile
`GetHitVar` handoff as the original HitDef.

## Source contract

Ikemen documents `ModifyHitDef` as updating the active HitDef with the same
optional HitDef parameter family. Its runtime stores the resulting acceleration
components on defender get-hit variables.

Sources: [Ikemen-GO changed state-controller reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29#hitdef-parameters), [Ikemen-GO `char.go` source](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Scope

- Compile static `ModifyHitDef` acceleration values.
- Mutate the active normal `DemoMove.hitVars` in place while preserving all
  unrelated contact memory and existing T482 vector-Z mutation behavior.
- Keep dynamic expressions and omitted fields outside the typed mutation path.

## Claim ceiling

This slice does not claim dynamic `ModifyHitDef` expressions, facing/localcoord
scaling, Common1 acceleration/friction, Z physics, helper/team breadth, or full
Ikemen/M.U.G.E.N parity.

## Evidence

- Focused compiler and HitDef mutation coverage: 2 files / 89 tests passed.
- `pnpm typecheck` passed; final full/build/trace gates are recorded in the
  current roadmap checkpoint.
- Score movement: none.
