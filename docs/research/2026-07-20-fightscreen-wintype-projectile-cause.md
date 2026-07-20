# FightScreen projectile KO cause

Date: 2026-07-20  
Ticket: T325  
Status: implemented at bounded root-owned projectile scope

## Official source findings

Ikemen-GO writes the base result at the life-zero transition and reads the
attack attr held by the hit context. The source orders guard KO, hyper,
special, throw, and normal fallback after the ownership cases. The attack
mask definitions show why the classifier must keep the same precedence when a
projectile supplies the contact.

## Port slice

`RuntimeRoundWinTypeSystem` now owns the shared classifier. The projectile
combat loop captures life before applying damage, then records a cause only if
the defender reaches zero. It passes the effective projectile attr, including
the existing `S,SP` default used by projectile combat.

The runtime accepts the projectile as result evidence only when
`parentId === rootId`. A helper-owned projectile remains outside the result
until the project proves its source owner and player-slot admission. This
keeps the result from guessing a winner cause from incomplete helper data.

## Evidence

- Root-owned projectile KO coverage proves normal, special, hyper, and throw
  records.
- Omitted projectile attr coverage proves the combat default maps to special.
- Helper-owned projectile coverage proves the result cause stays unset.
- Existing direct-hit, team-fact, and result-composition tests remain green.
- Focused result: 4 files / 105 tests passed.
- TypeScript 7 typecheck and diff hygiene passed.

## Claim ceiling

This is root-owned projectile cause evidence. Helper projectiles, reversal and
reflection, suicide, teammate, exact source player-slot filtering, custom-state
timing, browser FightScreen proof, and full MUGEN/IKEMEN parity remain open.

## Source links

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
