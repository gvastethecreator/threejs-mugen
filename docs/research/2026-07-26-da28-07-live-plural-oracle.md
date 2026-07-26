# DA28-07 live PluralCombatOracle

Date: 2026-07-26  
Status: closed-bounded  
Depends on: DA28-06

## What landed

`LivePluralCombatOracle/v1` builds PluralCombatOracle cells from live
`RuntimeProjectile` subjects (roots and helpers) pulled from
`RuntimeEffectActorWorld` or free lists. It runs the live schedule first, then
the oracle matrix, and requires reorder/missing-subject mutations to fail
integrity.

## Evidence

| Gate | Result |
| --- | --- |
| Unit `LivePluralCombatOracle.test.ts` | multi-owner + helper integrity pass; single-subject integrity fail |

## Claim ceiling

Allowed: oracle consumes live roots/helpers; mutation integrity fails on reorder/missing.  
Blocked: browser plural matrix, full Ikemen parity, score movement.
