# 68 - T483 Ikemen-GO HitDef acceleration metadata

Status: closed-bounded
Labels: ikemen, runtime, combat, gethitvar
Lane: runtime / combat
Priority: P1
Depends on: T482 ModifyHitDef velocity Z mutation

## Objective

Preserve authored `HitDef` `xaccel`, `yaccel` and `zaccel` values as
defender-facing metadata and expose them through `GetHitVar` for direct,
imported and player-owned projectile contacts.

## Source contract

The official Ikemen-GO changed-controller reference documents `xaccel` and
`zaccel` as optional HitDef parameters and the runtime source copies all three
acceleration components into get-hit variables when a hit lands.

Sources: [Ikemen-GO changed state-controller reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29#hitdef-parameters), [Ikemen-GO `char.go` source](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Scope

- Compile static HitDef and Projectile acceleration metadata.
- Preserve the values through imported state moves and direct/projectile
  contact handoff.
- Expose `GetHitVar(xaccel)`, existing `GetHitVar(yaccel)` and
  `GetHitVar(zaccel)` with official zero defaults for omitted horizontal/depth
  components.
- Keep authored values intact; do not introduce new physics or expression
  evaluation in this slice.

## Claim ceiling

This slice does not claim Ikemen localcoord scaling/facing transforms for
`xaccel`, Common1 acceleration/friction, Z physics, dynamic expressions,
ModifyHitDef acceleration mutation, helper/team ownership breadth, or complete
M.U.G.E.N/Ikemen parity.

## Evidence

- Focused compiler/HitDef/direct/projectile/imported-fighter/expression
  coverage: 7 files / 249 tests passed.
- `pnpm typecheck` passed; final full/build/trace gates are recorded in the
  current roadmap checkpoint.
- Score movement: none.
