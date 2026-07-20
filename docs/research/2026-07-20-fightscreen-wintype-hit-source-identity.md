# FightScreen hit source identity

Date: 2026-07-20  
Ticket: T327  
Status: implemented at bounded explicit-player identity scope

## Official source findings

Ikemen-GO keeps the attacking player number in hit context as `ghv.playerno`.
At life zero, `Char.lifeSet` compares that number with the victim player and
team before selecting suicide, teammate, guard KO, or an attack base type.

## Port slice

Direct HitDef and projectile contact now write source metadata into
`CharacterRuntimeState.hitVars` when the attacking actor has an explicit
`playerNo`. The record includes actor id, root id, and whether the source was
root-owned. Direct helper actors preserve their root ancestry, while
helper-parented projectiles set `sourceRootOwned = false`.

Callers without explicit player identity receive no inferred metadata. This
keeps the next result classifier dependent on known source facts.

## Evidence

- Direct contact coverage proves explicit player identity reaches `hitVars`.
- Projectile contact coverage proves root ownership reaches `hitVars`.
- Existing Playable, helper combat, direct combat, projectile combat, and
  result classifier coverage remains green.
- Focused result: 5 files / 352 tests passed.
- TypeScript 7 typecheck and diff hygiene passed.

## Claim ceiling

This is metadata evidence only. Hit-state suicide, teammate classification,
helper ownership, reversal/reflection, browser FightScreen proof, and full
MUGEN/IKEMEN result parity remain open.

## Source link

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
