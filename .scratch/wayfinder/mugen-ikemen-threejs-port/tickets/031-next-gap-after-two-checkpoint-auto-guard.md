# Choose next gap after two-checkpoint automatic guard order

Type: research
Status: open
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

Pending source-order, pause snapshot, and compatibility-risk review.
