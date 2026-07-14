# Research: Dizzy Points Defaults and AttackMulSet Scaling

## Decision

Implement omitted direct HitDef `dizzypoints` as a signed receiver-resource
loss: `-damage * multiplier`. The normal route uses
`Default.LifeToDizzyPointsMul`; a hyper move attribute uses
`Super.LifeToDizzyPointsMul`. Authored `[Constants]` values override the
runtime fallback, explicit `dizzypoints` wins over the default, and the
dedicated `AttackMulSet.DizzyPoints` multiplier scales the signed outgoing
delta before defender defence scaling.

Official IKEMEN-GO documents the omitted HitDef default formula, the
`NoDizzyPointsDamage` suppression boundary, and the `AttackMulSet` specialized
`DizzyPoints` parameter in its changed-controller reference:
[State controllers (changed)](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29).
The shipped defaults are `1.8` for `Default.LifeToDizzyPointsMul` and `0` for
`Super.LifeToDizzyPointsMul` in [common.const](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/master/data/common.const).

## Implementation Boundary

- CNS `[Constants]` parsing now stores case-insensitive numeric constants.
- Imported fighters and active HitDef dispatch resolve omitted defaults from
  authored constants, with a dispatch-level constant contract for root-owned
  execution and actor-local constants for Helpers.
- `AttackMulSet` compiles and executes a dedicated `DizzyPoints` multiplier;
  the regular attack multiplier remains the fallback when no specialized value
  is authored.
- Signed values are preserved through attacker and defender scaling. Required
  traces cover the normal default and dedicated attack-scale routes.

## Deferred

Super-default trace breadth beyond the focused controller gate, helper-local
specialized multiplier persistence, dizzy break transitions, red-life
`LifeShare`, sharing, reset/persistence, HUD, rollback/netplay, and full
MUGEN/IKEMEN parity remain separate gates.
