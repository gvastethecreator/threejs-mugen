# DA28-08 live Turns transaction bridge

Date: 2026-07-26  
Status: closed-bounded  
Depends on: DA28-02

## What landed

- `LiveRuntimeTurnsBridge/v1` projects live roots into
  `RuntimeTurnsTransaction` prepare/validate/commit/restore.
- Fault injection restores preimage; replacement handoff helper covers KO→standby.
- `PlayableMatchRuntime.tryAutomaticTurnsContinuation` records
  `lastLiveTurnsBridge` around team-round handoff apply.

## Evidence

| Gate | Result |
| --- | --- |
| Unit `LiveRuntimeTurnsBridge.test.ts` | commit, post-commit fault restore, pre-commit fault |
| Typecheck | passed |
| Related Turns journey/handoff tests | passed |

## Claim ceiling

Allowed: live-shaped handoff receipts through the transaction model.  
Blocked: full browser Turns multi-replacement matrix (DA28-09), score movement.
