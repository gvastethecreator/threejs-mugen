# Wayfinder Ticket 159: Turns Roster and Recovery

## Status

Closed as Entry 520 on 2026-07-14 after focal and broad verification.

## Decision

Keep the official fallback recovery and roster sequencing visible in the
continuation transaction:

```text
KO/post-round complete
  -> ordered roster read
  -> winner recovery from remaining round ticks
  -> handoff
  -> resource reset
  -> state 5900
  -> continuation
```

## Implementation

- Added `RuntimeTurnsRecoveryWorld/v0` with the official default
  `1 / 300` rate, winner/life/time guards, max-life clamp, and diagnostics.
- Added `RuntimeTurnsRoster/v0` projection to the continuation plan with
  ordered active, standby, defeated, next, and remaining candidate IDs.
- Passed the real `RuntimeRoundSystem.remainingTimerFrames` into production
  continuation and applied recovered life before reset.
- Fixed promoted reserve eligibility so an active `p4` cannot be rejected as
  an invalid standby candidate during the next replacement.
- Added direct formula, multi-roster, second-promotion, and production-route
  assertions.

## Evidence

- Focal tests pass for `RuntimeTurnsRecoveryWorld`,
  `RuntimeTurnsContinuationWorld`, `RuntimeRoundSystem`, and the automatic
  `PlayableMatchRuntime` route.
- Broad suite passes 209 test files / 2110 tests, TypeScript 7, a 289-module
  build, boundaries, CSS budget, and 600/600 trace artifacts.
- Core browser smoke passes under
  `.scratch/qa/qa-smoke-turns-roster-recovery-core/`.

## Claim Ceiling

This is bounded fallback recovery and ordered in-memory roster sequencing. It
does not claim external-Lua recovery, preloaded asset swaps, exact score or
winpose choreography, rollback/netplay, or full MUGEN/IKEMEN parity.
