# FightScreen suicide KO cause

Date: 2026-07-20  
Ticket: T326  
Status: implemented at bounded root-state scope

## Official source findings

Ikemen-GO evaluates the player owner at the life-zero transition. A root
player whose own state logic reaches zero gets `WT_Suicide` when the actor is
outside hit state. The source checks helper and hit-state branches before the
other result families, so those paths need separate identity evidence.

## Port slice

The active root controller and State -1 resource paths now capture life before
dispatch. When a root-owned `LifeAdd` or `LifeSet` reduces that same root from
positive life to zero, the runtime records `suicide` on the opposing active
root. The classifier requires player-root team state, a matching source-owner
identity, and a non-hit move type.

This uses the existing root identity and team-state contracts. It does not
infer the source player from incomplete hit metadata or helper ancestry.

## Evidence

- Playable runtime coverage proves a root `LifeSet = 0` reaches the opposing
  root as `roundWinType = suicide`.
- Classifier coverage rejects helper-owned, hit-state, mismatched-owner, and
  still-alive cases.
- Focused result: 2 files / 281 tests passed.
- TypeScript 7 typecheck and diff hygiene passed.

## Claim ceiling

This is root-state self-KO evidence. Hit-state suicide, teammate, helper,
redirected resource, reversal/reflection, exact source player-slot filtering,
browser FightScreen proof, and full MUGEN/IKEMEN parity remain open.

## Source link

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
