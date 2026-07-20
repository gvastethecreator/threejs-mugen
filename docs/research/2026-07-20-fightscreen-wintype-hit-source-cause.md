# FightScreen hit-source cause

Date: 2026-07-20
Ticket: T329
Status: implemented at bounded root hit-source cause scope

## Official source findings

Ikemen-GO stores the attack attribute and guard-KO state in the hit context.
When a later life-zero transition occurs while the victim remains in hit state,
the engine uses that context after the suicide and teammate ownership checks.

## Port slice

Direct HitDef and projectile combat now preserve effective source attr and an
explicit guard-KO boolean in `GetHitVar` metadata. The direct path emits its
`S,NA` fallback and the projectile path emits its `S,SP` fallback. The shared
round result classifier uses this evidence for an opposing root-owned hit
source, retaining cheese or the source's normal/special/hyper/throw base cause.

The classifier still requires explicit source player identity and root-owned
metadata. Helper, redirected, rival-without-cause, and incomplete source paths
remain unchanged.

## Evidence

- Direct and projectile metadata tests prove source attr and guard-KO fields.
- Hit-state tests prove rival hyper and cheese causes survive a later resource
  KO.
- Same-player suicide, same-side teammate, helper, rival-without-cause, and
  incomplete source cases remain covered.
- Focused result: 4 files / 349 tests passed.
- TypeScript 7 typecheck and diff hygiene passed.

## Claim ceiling

This is root-owned source-cause evidence for direct and projectile hit state.
It does not establish helper or redirected ownership, reversal/reflection
semantics, exact source-slot arbitration, browser FightScreen proof, or full
MUGEN/IKEMEN parity.

## Source links

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
