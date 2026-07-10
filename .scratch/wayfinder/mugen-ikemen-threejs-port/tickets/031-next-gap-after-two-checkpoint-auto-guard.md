# Choose next gap after two-checkpoint automatic guard order

Type: research
Status: resolved
Blocked by: None

## Question

What is the smallest source-backed scheduling package that removes the remaining same-tick P1-started Pause player-order bias without changing established pause-time guard-state rules?

## Candidate Inputs

- IKEMEN GO all-character `actionPrepare` and sequential `actionRun` loops.
- Current `RuntimeMatchFighterAdvanceWorld` P1-started Pause cutoff.
- Existing Pause/SuperPause and hitpause branch schedule contracts.
- `MatchTickSchedule/v0` owner and actor diagnostics.
- Required Pause, SuperPause, guard-start, and controller-order traces.

## Answer

IKEMEN snapshots pause eligibility for every character in the all-character `actionPrepare` loop, then runs each prepared `actionRun` sequentially. Therefore a Pause/SuperPause started by P1 must not cancel P2's already-prepared same-tick pass. Remove the mid-pair `isPaused` cutoff and obsolete `advancedP2` result, preserve both players' pre/post automatic guard checks, and apply the paused branch on the next tick.

Implemented in `RuntimeMatchFighterAdvanceWorld`, focused unit/integration coverage, and the source note `docs/research/2026-07-10-same-tick-pause-player-order.md`. `pnpm qa:trace` passes 529/529 after correcting one stale SuperPause freeze-window expectation from 5 to 4 frames.
