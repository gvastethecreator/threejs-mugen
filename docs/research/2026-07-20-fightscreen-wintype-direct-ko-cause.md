# FightScreen direct KO cause

Date: 2026-07-20
Ticket: T324
Status: implemented at bounded direct-hit scope

## Official source findings

Ikemen-GO writes the base result when the defender's life reaches zero. It
checks suicide and teammate ownership first, then guard KO, hyper, special,
throw, and normal. The attack masks are ordered, so a hit with both hyper and
throw bits resolves as hyper, and one with special and throw bits resolves as
special.

## Port slice

The direct combat path now keeps a transient `roundWinType` on the attacker.
It records only an alive-to-zero transition. Guard KO becomes `cheese`; the
parsed HitDef attack types map to hyper, special, throw, or normal using the
source mask order. The match round bridge forwards that base fact into the
existing perfect/clutch composition.

Fighter reconstruction clears the transient field on reset. Projectile and
helper paths do not contribute a result cause in this slice.

## Evidence

- Direct combat coverage proves normal, special, hyper, throw, and guard-KO
  cheese records on life-zero transitions.
- Round coverage proves a direct special base composes with perfect.
- Match-round coverage proves the transient base reaches the display selection.
- Focused result: 4 files / 70 tests passed.
- TypeScript 7 typecheck and diff hygiene passed.

## Claim ceiling

This is direct HitDef cause evidence. Suicide, teammate, projectile, helper,
reversal, player-type admission, browser screenpack proof, and full
MUGEN/IKEMEN compatibility remain open.

## Source links

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
